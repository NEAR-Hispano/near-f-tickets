import { useRouter } from 'next/router';
import React from 'react';
import { useNear } from '../../hooks/useNear';
import Event from '../../models/Event';
import EventCard from '../Events/EventCard';
import { initContract } from '../near/near';

export default function Profile() {
  const [events, setEvents] = React.useState<Array<Event>>([]);
  const [nearContext, setNearContext] = useNear();
  const [username, setUsername] = React.useState('');

  const getEvents = async () => {
    setNearContext(await initContract());
    // setNearContext(await NEAR);
    // @ts-ignore: Unreachable code error
    setEvents(await nearContext.contracts.nftContract.get_events());
    setUsername(nearContext.contracts.nftContract.account.accountId);
  };

  React.useEffect(() => {
    getEvents();
  }, [events]);
  const router = useRouter();

  return (
    <div className="p-4 lg:p-8 min-h-screen">
      <div className="flex justify-between h-full">
        <h2 className="text-figma-400 font-semibold lg:text-2xl lg:self-center">
          My Events
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
