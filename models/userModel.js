import mongoose from "mongoose";

const { model, Schema } = mongoose;

const userSchema = new Schema(
  {
    Names: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    phoneNumber: {
        type: String,
        required: true
      },
    userPassword: {
      type: String,
      required: true
    },
    userRole: {
      type: String,
      required: false,
      default: "user",
      enum: ["user", "admin"]
    },
    tokens: {
      accessToken: {
        type: String,
        
      }
    }
  }
);

// Export the model
const User = model("user", userSchema);
export default User;