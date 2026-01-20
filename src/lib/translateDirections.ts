import { Language } from '@/i18n/translations';

// Translate Mapbox direction instructions to Vietnamese
export const translateInstruction = (instruction: string, language: Language): string => {
  if (language === 'en') {
    return instruction; // Keep English as-is from Mapbox
  }
  
  // Vietnamese translations
  let translated = instruction;
  
  // Common patterns
  const patterns: [RegExp, string][] = [
    // Turn instructions
    [/Turn left/gi, 'Rẽ trái'],
    [/Turn right/gi, 'Rẽ phải'],
    [/Turn slight left/gi, 'Rẽ nhẹ sang trái'],
    [/Turn slight right/gi, 'Rẽ nhẹ sang phải'],
    [/Turn sharp left/gi, 'Rẽ gấp sang trái'],
    [/Turn sharp right/gi, 'Rẽ gấp sang phải'],
    [/Slight left/gi, 'Rẽ nhẹ sang trái'],
    [/Slight right/gi, 'Rẽ nhẹ sang phải'],
    [/Sharp left/gi, 'Rẽ gấp sang trái'],
    [/Sharp right/gi, 'Rẽ gấp sang phải'],
    
    // Continue/Straight
    [/Continue straight/gi, 'Tiếp tục đi thẳng'],
    [/Continue on/gi, 'Tiếp tục theo'],
    [/Continue/gi, 'Tiếp tục'],
    [/Go straight/gi, 'Đi thẳng'],
    [/Head (north|south|east|west)/gi, 'Đi về hướng $1'],
    [/north/gi, 'bắc'],
    [/south/gi, 'nam'],
    [/east/gi, 'đông'],
    [/west/gi, 'tây'],
    [/northeast/gi, 'đông bắc'],
    [/northwest/gi, 'tây bắc'],
    [/southeast/gi, 'đông nam'],
    [/southwest/gi, 'tây nam'],
    
    // Arrival
    [/You have arrived at your destination/gi, 'Bạn đã đến điểm đích'],
    [/You have arrived/gi, 'Bạn đã đến nơi'],
    [/Arrive at/gi, 'Đến'],
    [/Your destination is on the left/gi, 'Điểm đến ở bên trái'],
    [/Your destination is on the right/gi, 'Điểm đến ở bên phải'],
    [/destination/gi, 'điểm đến'],
    
    // Other maneuvers
    [/Make a U-turn/gi, 'Quay đầu'],
    [/U-turn/gi, 'Quay đầu'],
    [/Enter the roundabout/gi, 'Đi vào vòng xuyến'],
    [/Exit the roundabout/gi, 'Ra khỏi vòng xuyến'],
    [/roundabout/gi, 'vòng xuyến'],
    [/Take the exit/gi, 'Đi theo lối ra'],
    [/Merge/gi, 'Nhập làn'],
    [/Fork left/gi, 'Rẽ trái tại ngã ba'],
    [/Fork right/gi, 'Rẽ phải tại ngã ba'],
    [/Keep left/gi, 'Đi bên trái'],
    [/Keep right/gi, 'Đi bên phải'],
    
    // Distance/time
    [/for (\d+) meters/gi, 'trong $1 mét'],
    [/for (\d+) m/gi, 'trong $1 mét'],
    [/for (\d+\.?\d*) kilometers/gi, 'trong $1 km'],
    [/for (\d+\.?\d*) km/gi, 'trong $1 km'],
    
    // Prepositions
    [/onto/gi, 'vào'],
    [/on the left/gi, 'ở bên trái'],
    [/on the right/gi, 'ở bên phải'],
    [/on your left/gi, 'bên trái bạn'],
    [/on your right/gi, 'bên phải bạn'],
    [/at the end of the road/gi, 'ở cuối đường'],
    [/at the intersection/gi, 'tại ngã tư'],
  ];
  
  for (const [pattern, replacement] of patterns) {
    translated = translated.replace(pattern, replacement);
  }
  
  return translated;
};
