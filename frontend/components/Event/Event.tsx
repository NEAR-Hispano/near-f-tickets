import { useRouter } from 'next/router';
import React from 'react';
import useUser from '../../hooks/useUser';
import Event from '../../models/Event';
import Modal from '../modal/Modal';
import { initContract } from '../near/near';
import TokenSeriesJson from '../../models/TokenSeriesJson';
import GiftIcon from '../icons/GiftIcon';
import { Input } from '../inputs/Input';

interface EventProps {
  event: Event;
}

export default function EventData({ event }: EventProps) {
  const router = useRouter();
  const [user] = useUser();
  const [isOpen, setIsOpen] = React.useState(false);
  const [receiver, setReceiver] = React.useState(user);
  const [asGift, setAsGif] = React.useState(false);

  const buyTicket = async (
    ticket: TokenSeriesJson,
    forMe: boolean,
    receiver?: string
  ) => {
    if (forMe) {
      setReceiver(user);
    }
    const { contracts } = await initContract();
    // @ts-ignore: Unreachable code error
    await contracts.nftContract.mint_ticket(
      {
        token_series_id: ticket.token_series_id,
        receiver_id: receiver,
      },
      '300000000000000',
      '465000000000000000000000'
    );
  };
  return (
    <div className="px-7 mt-8 mx-auto">
    <div className="content-center min-h-screen md:flex md:flex-col lg:flex lg:flex-col px-8 mt-3">
      <div className="mb-28 bg-lime-800 rounded-tr-md rounded-tl-md px-3 mt-3 rounded-b-md">
        <div className="lg:flex lg:justify-between lg:w-full lg:h-auto lg:p-8 bg-bg-event">
          <div className="text-figma-300">
            <h2 className="lg:text-9xl font-semibold">{event?.name}</h2>
            <h2 className="lg:text-2xl ">{event?.description}</h2>
          </div>
          <div className="px-8 lg:w-1/3 md:w-2/4 sm:w-2/4 mt-8">
            <img src={event?.banner} alt={event?.name} className="rounded-xl" />
          </div>
        </div>
        <div className="bg-emerald-900 rounded-2xl lg:py-7 lg:px-11 lg:text-center">
        <div className="text-figma-300 lg:p-8 lg:flex lg:justify-between">
          <div>
            <h2 className="lg:text-3xl">Event Information</h2>
            <h2>{event?.name}</h2>
            <h2>Total Capacity: {event?.capacity}</h2>
            <h2>Status: {event?.status}</h2>
            <h2>Available Tickets:</h2>
            {event?.tickets?.map((ticket, x) => (
              <div key={x}>
                <h2>
                  {x + 1} {'. '}
                  {ticket?.metadata?.title.toUpperCase()}
                </h2>
              </div>
            ))}
          </div>
          <div>
            {user === event?.organizer ? (
              <div>
                <button
                  type="button"
                  className="bg-figma-500 lg:px-4 lg:py-1.5 text-figma-400 lg:text-lg font-semibold rounded-lg"
                  onClick={() =>
                    router.push(`/app/event/update/${event?.index}`)
                  }
                >
                  Update Event
                </button>
              </div>
            ) : (
              <div className="bg-figma-500 rounded-2xl lg:w-96 lg:h-36 lg:p-5">
                <h2 className="text-xl">Organizer: {event?.organizer}</h2>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
      <div className="lg:fixed lg:bottom-0 md:fixed md:bottom-0 w-full sm:content-center">
        <div className="bg-figma-400 rounded-t-2xl lg:py-7 lg:px-11 lg:text-center">
          <div className="lg:flex lg:justify-evenly md:flex md:justify-evenly sm:justify-center ">
            <div>
              <h2 className="text-figma-500">Date</h2>
              <h2>17 Apr 2022</h2>
            </div>
            <div>
              <h2 className="text-figma-500">Price</h2>
              <h2>4/7/14 NEAR</h2>
            </div>

            <div>
              <button
                type="button"
                className="bg-figma-500 lg:px-4 lg:py-1.5 text-figma-400 rounded-md"
                onClick={() => {
                  setIsOpen(true);
                }}
              >
                Buy Now!
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        setOpen={setIsOpen}
        isOpen={isOpen}
        className="w-5/6 bg-gray-200 p-12 h-3/4"
      >
        <div>
          {event.tickets.map((ticketType, index) => (
            <div
              key={index}
              className="text-figma-100 lg:flex lg:justify-between lg:mt-3"
            >
              <div>
                <h2>{ticketType?.metadata?.title || 'No Ticket'}</h2>
              </div>
              <div>
                <div className="flex justify-between">
                  {!asGift ? (
                    <button
                      type="button"
                      className="lg:px-4 lg:py-1.5 rounded-lg bg-figma-500 text-figma-400"
                      onClick={() => buyTicket(ticketType, true, receiver)}
                    >
                      Buy for me
                    </button>
                  ) : null}
                  <div
                    className=" text-figma-500 cursor-pointerr"
                    onClick={() => setAsGif(!asGift)}
                  >
                    <GiftIcon className="w-7" />
                  </div>
                </div>
                {asGift ? (
                  <div className="text-figma-100">
                    <Input
                      required
                      type="text"
                      id="receiver"
                      name="receiver"
                      placeholder=""
                      className="h-8 text-sm rounded-lg my-3 text-black"
                      setValue={setReceiver}
                      label="Receiver Account"
                    />
                    <button
                      type="button"
                      className="lg:px-4 lg:py-1.5 rounded-lg bg-figma-500 text-figma-400"
                      onClick={() => buyTicket(ticketType, false, receiver)}
                    >
                      Buy as Gift
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
    </div>
  );
}
