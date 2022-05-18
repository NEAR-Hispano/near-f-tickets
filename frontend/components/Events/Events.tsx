import { useRouter } from 'next/router';
import React from 'react';
import Event from '../../models/Event';
import EventCard from '../Events/EventCard';
import { initContract } from '../near/near';

export default function Events() {
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
    <div className="p-4 lg:p-8 lg:min-h-screen">
      <div className="flex justify-between h-full">
        <h2 className="text-figma-400 font-semibold lg:text-2xl lg:self-center">
          All Events
        </h2>
        <button
          type="button"
          className="bg-figma-500 text-figma-400 px-4 py-1.5 rounded-lg lg:px-6 lg:py-2 lg:text-xl"
          onClick={() => router.push('/app/new')}
        >
          New Event
        </button>
      </div>
      <div className="lg:flex lg:justify-between lg:w-full lg:mt-7">
        {events.map((event, i) => (
          <div className="flex justify-center" key={i}>
            <EventCard data={event} key={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
