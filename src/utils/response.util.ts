type ResponseData<T> = {
    statusCode: number;
    message: string;
    data?: T; // Optional data field
};

const successResponse = <T>(code: number, message: string, data?: T): ResponseData<T> => {
    return { statusCode: code, message, data };
};

const errorResponse = <T>(code: number, message: string, data?: T): ResponseData<T> => {
    return { statusCode: code, message, data };
};

export { successResponse, errorResponse };
