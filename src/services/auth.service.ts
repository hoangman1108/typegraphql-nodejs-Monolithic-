import { AuthTokenCollection, IAuthToken } from '../models/token.model';
import { IUser, UserCollection } from '../models/user.model';
import { LoginInput } from '../Modules/Auth/type/auth.input';
import { Auth } from '../Modules/Auth/type/auth.type';
import { AuthToken } from '../Modules/User/type/authToken.type';
import { User } from '../Modules/User/type/user.type';
import { ObjectIdScalar } from '../Scalars/ObjectIdScalars';
import authUtils from '../Utils/auth';

class AuthService {
  async login(login: LoginInput): Promise<Auth> {
    const findUser: IUser | null = await UserCollection.findOne({ email: login.email });
    if (!findUser) {
      const error = new Error('Email does not exists');
      throw error;
    }

    const isMatch: any = await findUser.comparePassword(login.password);
    if (!isMatch) {
      const error = new Error('Password does not match');
      throw error;
    }

    const newAccessToken = await authUtils.generateAccessToken(findUser);
    const newRefreshToken = await authUtils.generateRefreshToken(findUser);

    const authToken = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      kind: '',
    };
    await AuthTokenCollection.findOne(
      { user: findUser.id },
      async (error: Error, existingUser: IAuthToken) => {
        if (existingUser) {
          await AuthTokenCollection.findOneAndUpdate(
            { user: findUser.id },
            authToken
          );
        }
        await AuthTokenCollection.create({
          user: findUser.id,
          ...authToken,
        });
      }
    );

    const result: any = await AuthTokenCollection.findOne({ user: findUser.id }).populate('user');

    const token: AuthToken = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      kind: result.kind,
    };

    const profile: User = {
      ...result.user.toObject(),
      id: ObjectIdScalar.parseValue(result.user.toObject().id),
    };
    return {
      token,
      profile,
    };
  }

  async getRefreshToken(accessToken: string): Promise<string> {
    return AuthTokenCollection.findOne({
      accessToken,
    }).then((token: IAuthToken | null) => {
      if (token) return token.refreshToken;
      return 'refresh token not exists';
    });
  }
}

export default AuthService;
