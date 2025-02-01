type ResponseData<T> = {
    statusCode: number;
    message: string;
    data?: T; // Optional data field
    totalRecords?: number;
};

const successResponse = <T>(code: number, message: string, data?: T, totalRecords?: number): ResponseData<T> => {
    return { statusCode: code, message, data, totalRecords };
};

const errorResponse = <T>(code: number, message: string, data?: T): ResponseData<T> => {
    return { statusCode: code, message, data };
};

export { successResponse, errorResponse };
