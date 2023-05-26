import { Request, Response } from "express";
import axios from "axios";
import AppError from "../errors/AppError";

import AuthUserService from "../services/UserServices/AuthUserSerice";
import { SendRefreshToken } from "../helpers/SendRefreshToken";
import { RefreshTokenService } from "../services/AuthServices/RefreshTokenService";
import { getIO } from "../libs/socket";
import User from "../models/User";

const service: any = axios.create({
  baseURL: "https://auth.izing.app/?rest_route=/izingpro/v1/auth",
  timeout: 20000
});

const validaapi = () => {
  return service({
    method: "post",
    data: {
      username: process.env.USUARIO_API,
      password: process.env.SENHA_API
    }
  });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const io = getIO();

  const { email, password } = req.body;

  try {
    await validaapi();
  } catch (error) {
    throw new AppError("ERROR_NO_PERMISSION_API_ADMIN", 404);
  }

  const { token, user, refreshToken, usuariosOnline } = await AuthUserService({
    email,
    password
  });

  SendRefreshToken(res, refreshToken);

  const params = {
    token,
    username: user.name,
    email: user.email,
    profile: user.profile,
    status: user.status,
    userId: user.id,
    tenantId: user.tenantId,
    queues: user.queues,
    usuariosOnline,
    configs: user.configs
  };

  io.emit(`${params.tenantId}:users`, {
    action: "update",
    data: {
      username: params.username,
      email: params.email,
      isOnline: true,
      lastLogin: new Date()
    }
  });

  return res.status(200).json(params);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const token: string = req.cookies.jrt;

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const { newToken, refreshToken } = await RefreshTokenService(token);

  SendRefreshToken(res, refreshToken);

  return res.json({ token: newToken });
};

export const logout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.body;
  if (!userId) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }
  const io = getIO();

  const userLogout = await User.findByPk(userId);

  if (userLogout) {
    userLogout.update({ isOnline: false, lastLogout: new Date() });
  }

  io.emit(`${userLogout?.tenantId}:users`, {
    action: "update",
    data: {
      username: userLogout?.name,
      email: userLogout?.email,
      isOnline: false,
      lastLogout: new Date()
    }
  });

  // SendRefreshToken(res, refreshToken);

  return res.json({ message: "USER_LOGOUT" });
};
