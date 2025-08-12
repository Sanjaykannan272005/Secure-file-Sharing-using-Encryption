export default function FileThumbnail({ file, onClick }) {
  const getIcon = (type) => {
    if (!type) return '📄';
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📕';
    if (type.includes('word')) return '📝';
    if (type.includes('excel')) return '📊';
    if (type.startsWith('text/')) return '📄';
    return '📎';
  };

  const getColor = (type) => {
    if (!type) return 'bg-gray-100';
    if (type.startsWith('image/')) return 'bg-green-100';
    if (type.startsWith('video/')) return 'bg-red-100';
    if (type.includes('pdf')) return 'bg-red-100';
    if (type.includes('word')) return 'bg-blue-100';
    if (type.startsWith('text/')) return 'bg-gray-100';
    return 'bg-gray-100';
  };

  return (
    <div 
      className={`w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer hover:shadow-md ${getColor(file.originalType)}`}
      onClick={onClick}
    >
      <span className="text-xl">
        {getIcon(file.originalType)}
      </span>
    </div>
  );
}