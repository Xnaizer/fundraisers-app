
export default function Footer() {

    const TopicsSubs = [
        {id: 1,name : 'Blockchain', path: 'https://www.ibm.com/think/topics/blockchain'},
        {id: 2, name : 'CrowdFunding', path: 'https://www.investopedia.com/terms/c/crowdfunding.asp'},
        {id: 3, name : 'IDRX Stablecoin', path: 'https://home.idrx.co/en'},
        {id: 4, name : 'Lisk Blockchain', path: 'https://lisk.com/'},
        {id: 5, name : 'Xellar', path: 'https://xellar.co/'},
    ]

    const ResourcesSubs = [
        {id: 1, name : 'Tutorials', path: '/'},
        {id: 2, name : 'Pelita Bangsa', path: 'https://lms.pelitabangsa.co.id/'},
        {id: 3, name : 'Research Papers', path: '/'},
        {id: 4, name : 'Code Samples', path: 'https://github.com/danantiri/smart-contract'},
        {id: 4, name : 'Tools', path: 'https://nextjs.org/'},
    ]
  
    return (
    <footer className="bg-black w-full">
        <div className="w-full bg-neutral-600 h-[0.1px] mb-4"></div>
      <div className="max-w-[100rem] mx-auto px-6 sm:px-10 md:px-16 pt-12 pb-6 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

        <div className="text-white p-2 max-w-[16rem] flex flex-col ">
          <div className="text-xl font-light tracking-tighter">
            <span className="text-cyan-400">Fund</span>
            <span className="text-white">raisers</span>
          </div>
            <p className="text-sm text-neutral-400 pt-2 leading-relaxed flex flex-wrap">
            {"Revolutionizing Crowdfunding with the Power of Blockchain.".split(" ").map((char, index) => (
                <span
                key={index}
                className="transition-colors duration-1000 ease-in hover:text-cyan-400 hover:duration-100 hover:ease-out cursor-pointer"
                >
                {char + "\u00A0"}
                </span>
            ))}
            </p>
        </div>

        <div className="text-white p-2 flex flex-col">
          <p className=" mb-1">Topics</p>
          {TopicsSubs.map((item) => (
            <div key={item.id}>
              <a  href={item.path} className="text-sm text-neutral-400 pt-2 "><span className="hover:text-cyan-400">{item.name}</span></a>
            </div>
          ))}
        </div>

        <div className="text-white p-2 flex flex-col">
          <p className=" mb-1">Resources</p>
          {ResourcesSubs.map((item,i) => (
            <div key={`${item.id}-${i}`} >
              <a  href={item.path} className="text-sm text-neutral-400 pt-2 "><span className="hover:text-cyan-400">{item.name}</span></a>
            </div>
          ))}
        </div>

        <div className="text-white p-2 flex flex-col">
          <p className=" mb-1">Contact</p>
          <a className="text-sm text-neutral-400 pt-2 break-words">Fundraisers.Business@gmail.co.id</a>
        </div>
      </div>

      <div className="text-center font-thin py-8 text-white text-[0.75rem] px-4">
        © 2024-2045, Fundraisers.com, Inc. or its affiliates.
      </div>
    </footer>
  );
}
