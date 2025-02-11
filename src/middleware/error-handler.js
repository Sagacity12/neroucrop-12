import createHttpError from "http-errors";

/**
 * handle error throw in any of the function 
 * @param {*} err throw error object
 * @param {*} req Request object 
 * @param {*} res Response object
 * @param {*} next Next function object
 * @returns errors response 
 */

export const errorHandler = (err, req, res, next) => {
    console.error(err);
    if(createHttpError.isHttpError(err)) {
        return res.status(err.status).send({ errors: [{ message: err.message }] });
    };
    return res.status(500).send({ errors: [{ message: "Internal Server Error" }] });
};

export default errorHandler;