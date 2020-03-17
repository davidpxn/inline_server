/**
 * Utils functions that are shared among multible modules are contained here.
 */


/**
* @param {function} fn - Async function to be wrapped into an error catching function.
*
* @returns {function} Error catching function wrapping the original function.
*/
function catchErrorsMiddleware(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}


/**
* @param {function} fn - Async function to be wrapped into an error catching function.
*
* @returns {function} Error catching function wrapping the original function.
*/
function catchErrors(fn) {
  return (args) => fn(args).catch((err) => console.error(err));
}


module.exports = {
  catchErrorsMiddleware,
  catchErrors,
};
