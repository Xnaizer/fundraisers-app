import { HiArrowCircleUp } from "react-icons/hi";

export default function ScrollToTop() {

    return (
        <div className="z-50 right-5 bottom-16 md:bottom-12  w-12 h-14 fixed flex items-center justify-center p-2 bg-neutral-800 hover:bg-neutral-900 rounded-xl shadow-2xl cursor-pointer duration-300 ease-in transition-all"
        onClick={() => {
            const target = document.getElementById('HomeSection');
            if(target){
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
                }}
        >
            <HiArrowCircleUp className="w-10 h-10 text-white"/>
        </div>
    )
}