import type { ChunkRender } from "../../stores/cacheStore";



export const useChunk = (chunk: ChunkRender | null) => {


    const [chunkData, setChunkData] = useState<{
        chunk: Chunk<DataType>;
        dtype: DataType;
    } | null>(null);
  
    const renderView = useCallback(
        async (
          signal: AbortSignal,
          chunk_coords: number[],
          chunk_shape: number[],
          c: number,
          t: number,
          z: number,
        ) => {
          // Load array if not already loaded
          const loadedArray = await loadArray();
    
          const selection = [
            c,
            t,
            z,
            {
              start: chunk_coords[3] * chunk_shape[3],
              stop: (chunk_coords[3] + 1) * chunk_shape[3],
              step: 1,
            },
            {
              start: chunk_coords[4] * chunk_shape[4],
              stop: (chunk_coords[4] + 1) * chunk_shape[4],
              step: 1,
            },
          ];
    
          const chunk = (await get(loadedArray, selection, {
            opts: { signal: signal },
          })) as Chunk<DataType>;
    
          return { chunk, dtype: loadedArray.dtype };
        },
        [loadArray],
      );