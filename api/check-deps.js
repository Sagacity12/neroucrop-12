export default function handler(req, res) {
  // List all loaded modules
  const modules = Object.keys(require.cache).map(key => {
    return {
      id: key,
      children: require.cache[key].children.map(child => child.id)
    };
  });
  
  res.status(200).json({
    moduleCount: modules.length,
    modules: modules.slice(0, 10) // Just show first 10 to avoid response size issues
  });
} 