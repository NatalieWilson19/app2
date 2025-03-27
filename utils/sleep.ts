export default function Sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), ms);
  });
}
