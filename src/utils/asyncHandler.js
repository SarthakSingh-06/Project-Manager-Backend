/*
Some asyncronous operations might fail ( like database operations ) thus we have to handle them with a try-catch block but we will have lots of routes and writng a try-catch block for each route individually is a bottleneck. Below function is a wrapper around original request handler which helps to avoid writing multiple try-catch blocks and makes our code look much cleaner.
*/

export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((error) => next(error)); // Call express in-built error handler in case of error
        // requestHandler() must return a rejected promise for catch block to run
        // Thus requestHandler() has to be an async function
    };
};
