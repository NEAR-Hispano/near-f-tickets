import { useRouter } from 'next/router';
import React from 'react';
import useUser from '../../hooks/useUser';
import Event from '../../models/Event';
import Modal from '../modal/Modal';
import { initContract } from '../near/near';
import TokenSeriesJson from '../../models/TokenSeriesJson';
import GiftIcon from '../icons/GiftIcon';
import { Input } from '../inputs/Input';
import { ONE_NEAR_IN_YOCTO } from '../utils';

interface EventProps {
  event: Event;
}

export default function EventData({ event }: EventProps) {
  const router = useRouter();
  const [user] = useUser();
  const [isOpen, setIsOpen] = React.useState(false);
  const [receiver, setReceiver] = React.useState(user);
  const [asGift, setAsGif] = React.useState(false);
  const [month, setMonth] = React.useState('');
  const [day, setDay] = React.useState('');
  const [year, setYear] = React.useState('');

  const formatDate = () => {
    const x: Date = new Date(event?.date);
    const mon = x.toLocaleString('default', { month: 'long' });
    setMonth(mon);
    const y = event?.date?.split('-');
    setDay(y[2]);
    setYear(y[0]);
  };

  React.useEffect(() => {
    formatDate();
  }, []);

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
      BigInt(ticket?.price + 465000000000000000000000).toString()
    );
  };
  return (
    <div className="min-h-screen lg:flex lg:flex-col lg:mt-24">
      <div className="mb-28">
        <div className="lg:flex lg:justify-between lg:w-full lg:h-auto lg:p-8 bg-bg-event">
          <div className="text-figma-300 lg:w-6/12">
            <h2 className="lg:text-7xl font-semibold">{event?.name}</h2>
            <h2 className="lg:text-2xl mt-4">{event?.description}</h2>
          </div>
          <div className="lg:w-5/12">
            <img src={event?.banner} alt={event?.name} className="rounded-xl" />
          </div>
        </div>
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
      <div className="lg:fixed lg:bottom-0 w-full">
        <div className="bg-figma-400 rounded-t-2xl lg:py-7 lg:px-11 lg:text-center">
          <div className="lg:flex lg:justify-between">
            <div>
              <h2 className="text-figma-500">Date</h2>
              <h2>
                {day} {month} {year}
              </h2>
            </div>
            <div>
              <h2 className="text-figma-500">Time</h2>
              <h2>{event?.time}</h2>
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
                <h2>
                  {ticketType?.metadata?.title || 'No Ticket'} Price:{' '}
                  {Math.round(
                    (ticketType?.price / ONE_NEAR_IN_YOCTO + Number.EPSILON) *
                      100
                  ) / 100}
                </h2>
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
  );
}
