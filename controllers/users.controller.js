import { AppError } from "../middlewares/errorHandler.js";
import crypto from "crypto";
import { User } from "../models/user.model.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/feature.js";
import path from "path";
import { setCookieOptions } from "../utils/cookieOptions.js";
import { sendPasswordResetEmail } from "../utils/email.js";
export const registerCtrl = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return next(new AppError("all fields required!", 400));
    }
    const findEmail = await User.findOne({ email });
    if (findEmail) {
      return next(new AppError("email already exists", 400));
    }
    const findUser = await User.findOne({ username });
    if (findUser) {
      return next(new AppError("username already exists", 400));
    }

    const newUser = new User({
      email,
      username,
      password,
    });

    await newUser.save();
    const { password: _password, ...otherDetail } = newUser._doc;
    res.status(201).json({
      message: "User created successfully",
      data: otherDetail,
    });
  } catch (error) {
    next(error);
  }
};

// Login

export const loginCtrl = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return next(new AppError("all fields is required!", 400));
    }
    const findEmail = await User.findOne({ email });
    if (!findEmail) {
      return next(new AppError("email does not exist", 400));
    }
    const isMatch = await findEmail.comparePassword(password);
    if (!isMatch) {
      return next(new AppError("wrong password", 400));
    }
    const token = findEmail.getJwtToken();
    if (!token) {
      return next(new AppError("something went wrong", 400));
    }

    const { password: _password, ...otherDetail } = findEmail._doc;
    res.status(200).cookie("access_token", token, setCookieOptions()).json({
      message: "Login successful",
      data: otherDetail,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logoutCtrl = async (req, res, next) => {
  try {
    res
      .clearCookie("access_token", { path: "/" })
      .status(200)
      .json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

// Get all users
export const getAllUsersCtrl = async (req, res, next) => {
  try {
    const users = await User.find();
    const { password: p, ...others } = users.map((user) => {
      const { password: p, ...others } = user._doc;
      return others;
    });
    const countDoc = await User.countDocuments();
    res.status(200).json({
      message: "Get all users successfully",
      count: countDoc,
      data: others,
    });
  } catch (error) {
    next(error);
  }
};

// Get my profile
export const getMyProfileCtrl = async (req, res, next) => {
  try {
    // เข้าถึงข้อมูลผู้ใช้จาก req.user (ที่ได้จาก authMiddleware)
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }
    res.status(200).json({
      message: "Get profile successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Update profile

export const updateProfileCtrl = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  try {
    if (req.body.username && req.body.username !== user.username) {
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        return next(new AppError("username already exists!", 400));
      }
      console.log(req.body);

      user.username = req.body.username;
    }
    if (req.body.oldPassword && req.body.newPassword) {
      const isMatch = await user.comparePassword(req.body.oldPassword);
      if (!isMatch) {
        return next(new AppError("Invalid old password", 400));
      }

      user.password = req.body.newPassword;
    }
    // ตรวจสอบและอัปโหลดรูปภาพ
    if (req.file) {
      const file = getDataUri(req.file);

      // ตรวจสอบว่า public_id มีค่าอยู่
      if (user.profilePicture.public_id) {
        await cloudinary.v2.uploader.destroy(user.profilePicture.public_id);
      } else {
        console.log("No previous image to delete.");
      }

      // สร้างโฟลเดอร์เฉพาะของผู้ใช้ โดยใช้ userID หรือ username
      const publicId = `users/${user.username}/profile_pictures/${
        path.parse(req.file.originalname).name
      }`;

      const cdb = await cloudinary.v2.uploader.upload(file.content, {
        public_id: publicId, // กำหนด public_id พร้อมโฟลเดอร์เฉพาะ
        resource_type: "image",
        overwrite: true,
      });

      user.profilePicture = {
        public_id: cdb.public_id,
        url: cdb.secure_url,
      };
    }
    const updatedUser = await user.save();
    const { password: _password, ...otherDetail } = updatedUser._doc;
    res.status(200).json({
      message: "update success",
      data: otherDetail,
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID

export const getUserByIdCtrl = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      message: "Get user successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user by ID

export const deleteUserByIdCtrl = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }
    // ตรวจสอบว่า public_id มีค่าอยู่
    if (user.profilePicture.public_id) {
      await cloudinary.v2.uploader.destroy(user.profilePicture.public_id);
    } else {
      console.log("No previous image to delete.");
    }
    await user.deleteOne();
    res.status(200).json({
      message: "Delete user successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Delete My Account

export const deleteMyAccountCtrl = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.profilePicture.public_id) {
      await cloudinary.v2.uploader.destroy(user.profilePicture.public_id);
    } else {
      console.log("No previous image to delete.");
    }
    await user.deleteOne();
    res.status(200).json({
      message: "Delete user successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordCtrl = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save();

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    res.status(200).json({ message: "Password reset link sent" });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordCtrl = async (req, res, next) => {
  const { token } = req.params; // อ่าน token จาก URL parameter
  const { newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required" });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }

    await user.resetPassword(newPassword);

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    next(error);
  }
};
