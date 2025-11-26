import axios from 'axios';

export const faceApiUrl = axios.create({
    baseURL: 'http://localhost:9999/api',
    headers: {
        'Content-Type': 'application/json'
    }});

//1.huấn luyện gương mặt lần đầu cho user mới bằng cách chụp ảnh và gởi python để tạo mô hình nhận diện cho user
export const trainFace = async (userId, imageBase64, trainedByUserId, token) => faceApiUrl.post(
    `/face-training/train`, {userId, imageBase64, trainedByUserId},
    {headers: {Authorization: `Bearer ${token}`}});
//2. cập nhạt lại gương mặt cho nhan viên
export const updateFaceTraining = async (userId, imageBase64, trainedByUserId, token) => faceApiUrl.post(
    `/face-training/update`, {userId, imageBase64, trainedByUserId},
    {headers: {Authorization: `Bearer ${token}`}});
//3.trả về true/false xem user dã đucowj huấn luyện khoun mặt chưa
export const checkUserFaceTrained = async (userId, token) => faceApiUrl.get(
    `/face-training/check/${userId}`, {headers: {Authorization: `Bearer ${token}`}});
//4 lấy ds all user chưa hluyen
export const getAllUntrainedUsers = async (token) => faceApiUrl.get(
    `/face-training/all/untrained`, {headers: {Authorization: `Bearer ${token}`}});

//------------------
//5. scan mặt và chấm công
export const scanFaceAndAttendance = async (imageBase64, scanType) => faceApiUrl.post(
    `/face-scan/attendance`, {imageBase64, scanType});
//6. admin vaf HR xem lôi quét face
export const getFailedScans = async (token) => faceApiUrl.get(
    `/face-scan/errors`, {headers: {Authorization: `Bearer ${token}`}});
//7. lich sử chấm công trong ngày
export const getScansInDay = async (userId, token) => faceApiUrl.get(
    `/face-scan/day/${userId}`, {headers: {Authorization: `Bearer ${token}`}});
//8. kiểm tra user đã chấm công hôm nay chưa
export const hasCheckedInToday = async (userId, token) => faceApiUrl.get(
    `/face-scan/checked-in/${userId}`, {headers: {Authorization: `Bearer ${token}`}});
//9 check in cuối cùng
export const getLatestCheckInToday = async (userId, token) => faceApiUrl.get(
    `/face-scan/latest-checkin/${userId}`, {headers: {Authorization: `Bearer ${token}`}});
//10 chẹck out cuoi cung
export const getLatestCheckOutToday = async (userId, token) => faceApiUrl.get(
    `/face-scan/latest-checkout/${userId}`, {headers: {Authorization: `Bearer ${token}`}});