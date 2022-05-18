import { useRouter } from 'next/router';
import React from 'react';
import Event from '../../models/Event';
import Carousel from '../Carousel/Carousel';
import EventCard from '../Events/EventCard';
import { initContract } from '../near/near';
export default function Home() {
  const [events, setEvents] = React.useState<Array<Event>>([]);

  const getEvents = async () => {
    const { contracts } = await initContract();
    // @ts-ignore: Unreachable code error
    setEvents(await contracts.nftContract.get_events());
  };

  React.useEffect(() => {
    getEvents();
  }, [events]);
  const router = useRouter();

  return (
    <div>
      {events.length > 0 ? (
        <div>
          <div>
            <Carousel />
          </div>
          <div className="p-4 lg:p-8">
            <div className="flex justify-between h-full">
              <h2 className="text-figma-400 font-semibold lg:text-2xl lg:self-center">
                Upcoming Events
              </h2>
              <button
                type="button"
                className="bg-figma-500 text-figma-400 px-4 py-1.5 rounded-lg lg:px-6 lg:py-2 lg:text-xl"
                onClick={() => router.push('/app/new')}
              >
                New Event
              </button>
            </div>
            <div className="flex justify-center lg:grid lg:grid-cols-4">
              {events.map((event, i) => (
                <div className="flex justify-center" key={i}>
                  <EventCard data={event} key={i} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
