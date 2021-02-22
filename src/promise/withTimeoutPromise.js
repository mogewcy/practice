var withTimeoutPromise = ({ promise, delay }) => {
  let hasTimeout = false;

  const timeoutPromise = (delay) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        hasTimeout = true;

        resolve();
      }, delay);
    });
  };

  const promises = [timeoutPromise.call(null, delay), promise];

  return Promise.race(promises).then((res) => {
    if (hasTimeout) {
      return Promise.reject("your promise is timeout");
    }

    return res;
  });
};

export default withTimeoutPromise;
