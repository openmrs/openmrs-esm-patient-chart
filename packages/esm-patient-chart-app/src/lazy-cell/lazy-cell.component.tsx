import React, { useEffect, useState } from 'react';

export function LazyCell({ lazyValue }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    Promise.resolve(lazyValue).then((value) => setValue(value));
  }, [lazyValue]);

  return <>{value}</>;
}
