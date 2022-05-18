import { useRouter } from 'next/router';
import React from 'react';
import { useNear } from '../../hooks/useNear';
import useUser from '../../hooks/useUser';
import Event from '../../models/Event';
import { LogOutIcon } from '../icons';
import { initContract } from '../near/near';
import SearchBar from './SearchBar';

export default function Navbar() {
  const router = useRouter();
  const [nearContext] = useNear();
  const [user, setUser] = useUser();
  const [events, setEvents] = React.useState<Array<Event>>(null);

  const currentPage = router.route;

  const logIn = async () => {
    await nearContext.walletConnection.requestSignIn(
      nearContext.nearConfig.contractName[0]
    );
  };

  const logOut = async () => {
    await setUser('');
    await nearContext.walletConnection.signOut();
  };

  const getEvents = async () => {
    const { contracts } = await initContract();
    // @ts-ignore: Unreachable code error
    setEvents(await contracts.nftContract.get_events());
  };

  React.useEffect(() => {
    getEvents();
  }, []);

  return (
    <div className="min-w-full text-figma-400 px-4 py-2 text-lg self-center h-auto">
      <div className="flex justify-between">
        <div className="self-center">
          {/* <h2 className="drop-shadow-md text-3xl">NEAR Future Tickets</h2> */}
          <img
            src="/logo_horizontal.png"
            alt=""
            className="w-52 cursor-pointer"
            onClick={() => router.push('/app')}
          />
        </div>
        <div className="self-center">
          <div className="flex space-x-24">
            <button type="button" onClick={() => router.push('/app')}>
              <h2
                className={`font-semibold ${
                  currentPage === '/app'
                    ? 'underline underline-offset-8 decoration-figma-500 decoration-4'
                    : ''
                }`}
              >
                Home
              </h2>
            </button>
            <button type="button" onClick={() => router.push('/app/events')}>
              <h2
                className={`font-semibold ${
                  currentPage === '/app/events'
                    ? 'underline underline-offset-8 decoration-figma-500 decoration-4'
                    : ''
                }`}
              >
                All Events
              </h2>
            </button>
            <button type="button" onClick={() => router.push('/app/profile')}>
              <h2
                className={`font-semibold ${
                  currentPage === '/app/profile'
                    ? 'underline underline-offset-8 decoration-figma-500 decoration-4'
                    : ''
                }`}
              >
                My Events
              </h2>
            </button>
          </div>
        </div>
        <div className="self-center">
          <SearchBar
            className="rounded-lg border-2 h-8 py-px px-3"
            events={events}
          />
        </div>
        <div className="flex self-center">
          {user === '' ? (
            <div>
              <button
                type="button"
                className="bg-figma-500 text-figma-400 font-semibold w-full h-auto px-6 py-2 rounded-lg"
                onClick={() => {
                  logIn();
                }}
              >
                Login
              </button>
            </div>
          ) : (
            <div className="flex self-center">
              <span className="bg-figma-500 text-figma-400 font-semibold w-full h-auto px-6 py-2 rounded-lg">
                {user}
              </span>

              <div className="align-middle">
                <button
                  className=" hover:text-gray-400 text-white w-7 h-full ml-3"
                  onClick={() => {
                    logOut();
                  }}
                >
                  <LogOutIcon />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
