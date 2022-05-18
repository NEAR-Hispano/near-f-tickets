import { useRouter } from 'next/router';
import React from 'react';
import { useNear } from '../../hooks/useNear';
import useUser from '../../hooks/useUser';
import { LoginIcon } from '../icons';

export default function MobileNav() {
  const router = useRouter();
  const [nearContext] = useNear();
  const [user, setUser] = useUser();
  const currentPage = router.route;
  const startingLetter = user.charAt(0);

  const logIn = async () => {
    await nearContext.walletConnection.requestSignIn(
      nearContext.nearConfig.contractName[0]
    );
  };

  const logOut = async () => {
    await setUser('');
    await nearContext.walletConnection.signOut();
  };
  return (
    <div className="flex justify-between p-4">
      <div className="self-center">
        <h2 className="text-lg font-semibold text-figma-300">NFT</h2>
      </div>
      <div className="flex text-figma-300 space-x-7">
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
            Profile
          </h2>
        </button>
      </div>
      {user !== '' ? (
        <div className="">
          <button
            type="button"
            className="bg-figma-500 text-figma-300 rounded-full px-2 py-px shadow-lg self-center text-lg"
            onClick={() => {
              logOut();
            }}
          >
            {startingLetter}
          </button>
        </div>
      ) : (
        <div className="">
          <button
            type="button"
            className=""
            onClick={() => {
              logIn();
            }}
          >
            <LoginIcon className="w-6 h-6 text-figma-300" />
          </button>
        </div>
      )}
    </div>
  );
}
