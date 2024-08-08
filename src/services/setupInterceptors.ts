import { apiInstance } from './api';
import { userInfoStore } from '../store/user'
import { jwtDecode } from "jwt-decode";

const checkTokenExp = (token:string) => {
    interface BKEToken {
        user_id: string;
        email: string;
        expires: number;
        }
    const decoded = jwtDecode<BKEToken>(token);
    // console.log(decoded);
    if (decoded.expires) {
        const tokenExp = decoded.expires;
        const currentTime = Math.floor(Date.now() / 1000);
        // console.log(tokenExp, currentTime);
        if (tokenExp > currentTime) return true;
    }
    return false;
}
const setup = () => {

    apiInstance.interceptors.request.use(
        (config) => {
            const token = userInfoStore().userInfo.token;
            if (token && checkTokenExp(token)) {
                config.headers["Authorization"] = 'Bearer ' + token;
                // config.headers["x-access-token"] = token;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    apiInstance.interceptors.response.use(
        (res) => {
            return res;
        },
        async (err) => {
            // const originalConfig = err.config;
            // For refresh token

            // if (originalConfig.url !== "/auth/login" && err.response) {
            //   // Access Token was expired
            //   if (err.response.status === 401 && !originalConfig._retry) {
            //     originalConfig._retry = true;

            //     try {
            //       const rs = await axiosInstance.post("/auth/refreshtoken", {
            //         refreshToken: 'TokenService.getLocalRefreshToken()',
            //         // refreshToken: TokenService.getLocalRefreshToken(),
            //       });

            //       const { accessToken } = rs.data;

            //       store.dispatch('auth/refreshToken', accessToken);
            //       // TokenService.updateLocalAccessToken(accessToken);

            //       return axiosInstance(originalConfig);
            //     } catch (_error) {
            //       return Promise.reject(_error);
            //     }
            //   }
            // }

            return Promise.reject(err);
        }
    );
};

export default setup;