export const resolveImage = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800';
  if (url.startsWith('http')) return url;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  return `${backendUrl}${url}`;
};
