import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="flex-1 bg-[#ebebeb] flex items-center justify-center flex-col p-[20px] w-full min-h-[500px]">
      <div className="flex flex-col items-center text-center max-w-[480px]">
        
        {/* Illustration */}
        <div className="relative w-[240px] h-[200px] mb-[28px]">
          {/* Background soft circle */}
          <div className="absolute left-[30px] top-[40px] w-[120px] h-[120px] rounded-full bg-[#dcdceb] opacity-45 z-0"></div>

          {/* Curl / scribble */}
          <svg className="absolute left-0 top-[10px] z-[2]" width="60" height="70" viewBox="0 0 60 70" fill="none">
            <path d="M10 60 C10 30, 40 50, 35 20 C32 5, 20 10, 25 25" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          </svg>

          {/* Small top-right card */}
          <div className="absolute right-0 top-0 w-[90px] h-[50px] bg-white rounded-[6px] shadow-[0_2px_10px_rgba(0,0,0,0.08)] flex items-center justify-center gap-[6px] px-[10px]">
            <div className="w-[10px] h-[10px] rounded-full bg-[#c0bfd0]"></div>
            <div className="h-[6px] rounded-[3px] bg-[#e0e0e8] flex-1"></div>
          </div>

          {/* Main document */}
          <div className="absolute right-[20px] top-[20px] w-[130px] h-[160px] bg-white rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.10)] p-[18px_14px_14px_14px] flex flex-col gap-[8px] z-[1]">
            <div className="h-[7px] rounded-[4px] bg-[#2d2d3a] w-[60%]"></div>
            <div className="h-[7px] rounded-[4px] bg-[#e0e0e8] w-[80%]"></div>
            <div className="h-[7px] rounded-[4px] bg-[#e0e0e8] w-[90%]"></div>
            <div className="h-[7px] rounded-[4px] bg-[#e0e0e8] w-[60%]"></div>
            <div className="h-[7px] rounded-[4px] bg-[#e0e0e8] w-[70%]"></div>
          </div>

          {/* Magnifier */}
          <div className="absolute left-[10px] bottom-0 w-[110px] h-[110px] z-[3]">
            <div className="absolute left-0 top-0 w-[90px] h-[90px] rounded-full bg-[#c8c3eb] opacity-45 border-[8px] border-[#b4afdc] flex items-center justify-center mix-blend-multiply"></div>
            <div className="absolute left-0 top-0 w-[90px] h-[90px] rounded-full flex items-center justify-center z-[4]">
              <div className="w-[46px] h-[46px] bg-[#ef4444] rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-[28px] h-[28px] stroke-white fill-none stroke-[3]"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
            </div>
            {/* Handle positioned correctly via style transform as requested by CSS */}
            <div 
              className="absolute right-0 bottom-0 w-[30px] h-[8px] bg-[#b0aac8] rounded-[4px] z-[3]"
              style={{ transform: "rotate(45deg)", transformOrigin: "left center" }}
            ></div>
          </div>

          {/* Decorative elements */}
          <div className="absolute left-[22px] bottom-[10px] text-[#60a5fa] text-[20px] leading-none z-[4]">✦</div>
          <div className="absolute right-[-10px] top-[50%] w-[10px] h-[10px] rounded-full bg-[#3b82f6] z-[4]"></div>
        </div>

        {/* Text */}
        <h2 className="text-[19px] font-[700] text-[#1a1a1a] mb-[12px]">
          No assignments yet
        </h2>
        <p className="text-[14px] text-[#777] leading-[1.6] mb-[28px]">
          Create your first assignment to start collecting and grading student<br className="hidden sm:block"/>
          submissions. You can set up rubrics, define marking criteria, and let AI<br className="hidden sm:block"/>
          assist with grading.
        </p>

        {/* Create Button */}
        <Link href="/assignments/create" className="flex items-center gap-[8px] bg-[#1a1a1a] text-white rounded-[28px] py-[14px] px-[28px] text-[14.5px] font-[600] hover:bg-[#333] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" stroke="white" fill="none" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Your First Assignment
        </Link>
      </div>
    </div>
  );
}
