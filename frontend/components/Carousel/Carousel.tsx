import { useRouter } from 'next/router';
import React from 'react';
import Event from '../../models/Event';
import { initContract } from '../near/near';

let count = 0;
export default function CarouselComponent() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [events, setEvents] = React.useState<Array<Event>>();
  const [featuredEvents, setFeaturedEvents] = React.useState<Array<Event>>([]);
  const router = useRouter();

  const getEvents = async () => {
    const { contracts } = await initContract();
    // @ts-ignore: Unreachable code error
    setEvents(await contracts.nftContract.get_events());
    const featuredEventss: Array<Event> = [];
    if (events) {
      for (let index = 0; index < events.length; index++) {
        featuredEventss.push({
          banner: events[index].banner,
          name: events[index].name,
          description: events[index].description,
          index: events[index].index,
        });
      }
      setFeaturedEvents(featuredEventss);
    }
  };

  const removeAnimation = () => {
    slideRef.current.classList.remove('fade-anim');
  };

  React.useEffect(() => {
    getEvents();
  }, [events]);

  React.useEffect(() => {
    slideRef.current.addEventListener('animationend', removeAnimation);
    startSlider();
  }, []);

  const startSlider = () => {
    setInterval(() => {
      handleOnNextClick();
    }, 10000);
  };

  const slideRef = React.useRef(null);

  const handleOnNextClick = () => {
    count = (count + 1) % featuredEvents.length;
    setCurrentIndex(count);
    slideRef?.current?.classList?.add('fade-anim');
  };
  const handleOnPrevClick = () => {
    count = (currentIndex + featuredEvents.length - 1) % featuredEvents.length;
    setCurrentIndex(count);
    slideRef?.current?.classList?.add('fade-anim');
  };

  return (
    <div>
      {featuredEvents ? (
        <div ref={slideRef} className="select-none relative bg-bg-event p-12">
          <div className="flex justify-between">
            <div className="justify-start">
              <h2
                className="text-figma-400 font-semibold text-8xl cursor-pointer"
                onClick={() =>
                  router.push(
                    `/app/event/${featuredEvents[currentIndex].index}`
                  )
                }
              >
                {featuredEvents[currentIndex]?.name}
              </h2>
              <h2 className="text-figma-400 font-semibold mt-9 text-3xl">
                {featuredEvents[currentIndex]?.description}
              </h2>
            </div>
            <div className="max-w-lg">
              <img
                src={featuredEvents[currentIndex]?.banner}
                alt=""
                className="w-full rounded-lg cursor-pointer"
                onClick={() =>
                  router.push(
                    `/app/event/${featuredEvents[currentIndex].index}`
                  )
                }
              />
            </div>
          </div>
          {/* <div className="absolute top-1/2 transform translate-y-1/2 py-2 w-full flex justify-between items-center">
        <button onClick={handleOnPrevClick}>Previous</button>
        <button onClick={handleOnNextClick}>Next</button>
      </div> */}
        </div>
      ) : null}
    </div>
  );
}
