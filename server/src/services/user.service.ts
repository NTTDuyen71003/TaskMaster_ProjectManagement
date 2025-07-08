import UserModel from "../models/user.model";
import { BadRequestException } from "../utils/appError";

export const getCurrentUserService = async (userId: string) => {
    // Tìm người dùng theo userId và lấy thông tin workspace hiện tại, loại bỏ trường password
    const user = await UserModel.findById(userId)
        .populate("currentWorkspace")
        .select("-password");
    // Nếu không tìm thấy người dùng, ném ra lỗi "User not found"
    if (!user) {
        throw new BadRequestException("User not found");
    }

    return {
        user,
    };
};
