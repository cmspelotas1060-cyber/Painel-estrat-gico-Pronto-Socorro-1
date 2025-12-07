import React, { useState, useEffect } from 'react';
import { getGeoInsights } from '../services/geminiService';
import { MapPin, Navigation, ExternalLink, Loader2 } from 'lucide-react';

const GeoLocation: React.FC = () => {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [query, setQuery] = useState('Hospitais de referência próximos');
  const [result, setResult] = useState<{text: string, chunks: any[]} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log("Geo error", error)
      );
    }
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await getGeoInsights(query, location?.lat, location?.lng);
      setResult(data);
    } catch (e) {
      alert("Erro ao buscar dados de mapa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
       <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <MapPin className="text-red-500" />
          Inteligência Geográfica
        </h1>
        <p className="text-slate-500 mt-2">
          Utilize o Google Maps Grounding para encontrar referências e dados locais.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex gap-4 mb-6">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            placeholder="Ex: Farmácias 24h na região..."
          />
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Navigation size={18} />}
            Buscar
          </button>
        </div>

        {location && (
          <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
            <MapPin size={12} />
            Usando sua localização: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
        )}

        {result && (
          <div className="space-y-6 animate-fade-in">
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap">{result.text}</div>
            </div>

            {result.chunks?.map((chunk: any, idx: number) => {
              // Extract Maps Data if available
              const mapData = chunk.maps;
              if (!mapData) return null;

              return (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800">{mapData.title}</h4>
                    <p className="text-sm text-slate-500 truncate max-w-md">{mapData.uri}</p>
                  </div>
                  <a 
                    href={mapData.uri} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                  >
                    Ver no Maps <ExternalLink size={14} />
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeoLocation;