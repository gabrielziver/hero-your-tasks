import { useEffect, useRef } from "react";

interface RadarChartProps {
  stats: {
    strength: number;
    intelligence: number;
    willpower: number;
    charisma: number;
    creativity: number;
    wealth: number;
  };
}

const RadarChart = ({ stats }: RadarChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const attributes = [
      { label: "💪 Força", value: stats.strength },
      { label: "🧠 Inteligência", value: stats.intelligence },
      { label: "🔥 Vontade", value: stats.willpower },
      { label: "💫 Carisma", value: stats.charisma },
      { label: "🎨 Criatividade", value: stats.creativity },
      { label: "💰 Riqueza", value: stats.wealth },
    ];

    const angleStep = (Math.PI * 2) / attributes.length;

    // Draw hexagon grid (3 levels)
    for (let level = 1; level <= 3; level++) {
      ctx.beginPath();
      const levelRadius = (radius * level) / 3;
      
      for (let i = 0; i <= attributes.length; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * levelRadius;
        const y = centerY + Math.sin(angle) * levelRadius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * level})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw lines from center to vertices
    attributes.forEach((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "rgba(139, 92, 246, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw data polygon
    ctx.beginPath();
    attributes.forEach((attr, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const value = (attr.value / 100) * radius;
      const x = centerX + Math.cos(angle) * value;
      const y = centerY + Math.sin(angle) * value;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    
    // Fill with gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, "rgba(139, 92, 246, 0.4)");
    gradient.addColorStop(1, "rgba(103, 232, 249, 0.2)");
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Stroke with glow
    ctx.strokeStyle = "rgba(139, 92, 246, 0.8)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(139, 92, 246, 0.8)";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw points and labels
    attributes.forEach((attr, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const value = (attr.value / 100) * radius;
      const x = centerX + Math.cos(angle) * value;
      const y = centerY + Math.sin(angle) * value;
      
      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(103, 232, 249, 1)";
      ctx.shadowColor = "rgba(103, 232, 249, 0.8)";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Draw label
      const labelDistance = radius + 25;
      const labelX = centerX + Math.cos(angle) * labelDistance;
      const labelY = centerY + Math.sin(angle) * labelDistance;
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "12px Inter";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(attr.label, labelX, labelY);
    });
  }, [stats]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="w-full h-full"
      />
    </div>
  );
};

export default RadarChart;
