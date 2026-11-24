import { User } from "../models";

const userService = {
  create: async (data: { name: string; email: string }) => {
    try {
      return await User.create(data);
    } catch (err) {
      console.log("DB error: user create failed", err);
      return false;
    }
  },

  findById: async (id: number) => {
    try {
      return await User.findByPk(id);
    } catch (err) {
      console.log("DB error: user findById failed", err);
      return false;
    }
  },

  findByEmail: async (email: string) => {
    try {
      return await User.findOne({ where: { email } });
    } catch (err) {
      console.log("DB error: user findByEmail failed", err);
      return false;
    }
  },

  countByIds: async (ids: number[]) => {
    try {
      return await User.count({ where: { id: ids } });
    } catch (err) {
      console.log("DB error: user countByIds failed", err);
      return false;
    }
  },
};

export default userService;
