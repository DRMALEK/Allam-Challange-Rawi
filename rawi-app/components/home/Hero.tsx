import Link from 'next/link';

const Hero = () => {
  return (
    <div className="container pt-[188px] md:pt-[300px] pb-[215px] sm:pb-[290px] px-[22px] sm:px-0 mx-auto text-center">
      <a
        href="https://www.ibm.com/docs/en/SSYOK8/wsj/analyze-data/assets/ALLaM-1-13b-instruct-model-card.pdf"
        target="_blank"
        rel="noreferrer"
        className="border rounded-2xl py-3 px-8 text-slate-600 transition duration-300 ease-in-out sm:text-2xl text-xl cursor-pointer hover:text-slate-700"
      >
         <span className="font-bold">مدعوم بنموذج علّام للغة العربية</span>
      </a>
      <h3 className="text-center max-w-[867px] pb-5 sm:pb-7 text-[30px] sm:text-[50px] leading-[29.5px] tracking-[-0.8px] sm:leading-[55px] sm:tracking-[-1.74px] mx-auto sm:mt-12 mt-10">
         !تحدث معي، اسألني وناقشني عن القصائد    
      </h3>
      <p className="rounded-2xl py-3 px-8 text-slate-600 transition duration-300 ease-in-out sm:text-2xl text-xl cursor-pointer hover:text-slate-700">
        <span className="font-bold">واستمتع بجمال الشعر وسحر اللغة العربية</span>
      </p>
      <br></br>
      <Link href={'/dashboard'}>
        <button className="bg_linear rounded-full sm:px-14 px-12 py-[2.5px] sm:py-4 text-white text-center text-xl sm:text-[30px] font-medium leading-[37px] tracking-[-0.3px]">
          لا تنتظر، ابدأ الآن
        </button>
      </Link>
    </div>
  );
};

export default Hero;
