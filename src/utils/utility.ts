const setsAreEqual = <T>(setA: Set<T>, setB: Set<T>): boolean => {
  if (setA.size !== setB.size) return false;
  return Array.from(setA).every((item) => setB.has(item));
};

export { setsAreEqual };
