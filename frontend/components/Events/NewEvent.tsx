import { create } from 'ipfs-http-client';
import React from 'react';
import dayjs from 'dayjs';
import { useNear } from '../../hooks/useNear';
import useUser from '../../hooks/useUser';
import Event from '../../models/Event';
import ModalityDropdown from '../common/ModalityDropdown';
import { Input } from '../inputs/Input';
import useNotify from '../../hooks/useNotify';
import { ONE_NEAR_IN_YOCTO, toFixed } from '../utils';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import ExtraMetadata from '../../models/ExtraMetadata';
import Connect from '../common/Connect';

type Libraries = (
  | 'drawing'
  | 'geometry'
  | 'localContext'
  | 'places'
  | 'visualization'
)[];
const libraries: Libraries = ['places'];

export default function NewEvent() {
  const [name, setName] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [eventStatus, setEventStatus] = React.useState<number>(1);
  const [modality, setModality] = React.useState<number>();
  const [ticketTypeInput, setTicketTypeInput] = React.useState<string>('');
  const [ticketType, setTicketType] = React.useState<Array<string>>();
  const [ticketBanners, setTicketBanners] = React.useState<Array<string>>([]);
  const [file, setFile] = React.useState([]);
  const [urlArr, setUrlArr] = React.useState<string>('/banner_placeholder.jpg');
  const [nearContext] = useNear();
  const [user] = useUser();
  const [uploaded, setUploaded] = React.useState(false);
  const [capacityInput, setCapacityInput] = React.useState<string>('');
  const [capacity, setCapacity] = React.useState<Array<number>>();
  const [price, setPrice] = React.useState<Array<number>>();
  const [priceInput, setPriceInput] = React.useState<string>('');
  const [locationResponse, setLocationResponse] = React.useState('');

  const notify = useNotify();

  // Maps
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // @ts-ignore: Unreachable code error
  const client = create('https://ipfs.infura.io:5001/api/v0');

  const retrieveFile = async (e) => {
    e.preventDefault();
    setUploaded(false);
    const data = e.target.files[0];
    setFile(e.target.files[0]);
    try {
      const created = await client.add(data);
      setUploaded(true);
      const url = `https://ipfs.infura.io/ipfs/${created.path}`;
      setUrlArr(url);
    } catch (error) {
      console.log(error.message);
    }
  };

  const retrieveTicketFiles = async (e) => {
    e.preventDefault();
    setUploaded(false);
    const data = e.target.files;
    try {
      const urlList = [];
      for (let index = 0; index < data.length; index++) {
        const ticket_banner = data[index];
        const created = await client.add(ticket_banner);
        const url = `https://ipfs.infura.io/ipfs/${created.path}`;
        urlList.push(url);
      }
      setTicketBanners(urlList);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSubmit = async () => {
    if (dayjs(date).isBefore(dayjs(new Date()))) {
      return notify('Event Date cannot be before today', 'warning');
    }
    // @ts-ignore: Unreachable code error
    await nearContext.contracts.nftContract.create_event(
      {
        name: event.name,
        description: event.description,
        modality: event.modality,
        capacity: capacity,
        date: event.date,
        time: event.time,
        status: event.status,
        banner: event.banner,
        ticket_type: ticketType,
        ticket_banners: event.ticket_banners,
        price: price,
        location: event.location,
      },
      '300000000000000',
      '465000000000000000000000'
    );
  };

  const refactorCapacity = () => {
    const arr = [];
    const x = capacityInput.split(',').map(function (item) {
      arr.push(Number(item));
    });
    setCapacity(arr);
  };

  const refactorTicketType = () => {
    const arr = [];
    const x = ticketTypeInput.split(',').map(function (item) {
      arr.push(item);
    });
    setTicketType(arr);
  };

  const refactorPrice = () => {
    const arr = [];
    const x = priceInput.split(',').map(function (item) {
      arr.push(toFixed(Number(item) * ONE_NEAR_IN_YOCTO));
    });
    setPrice(arr);
  };

  React.useEffect(() => {
    if (capacityInput !== '') {
      refactorCapacity();
    }
    if (ticketTypeInput !== '') {
      refactorTicketType();
    }
    if (priceInput !== '') {
      refactorPrice();
    }
  }, [capacityInput, ticketTypeInput, priceInput]);

  const extra: ExtraMetadata = {
    verified: false,
  };

  const event: Event = {
    organizer: user,
    name: name,
    description: description,
    banner: urlArr,
    date: date,
    time: time,
    status: eventStatus,
    modality: modality,
    ticket_type: ticketType,
    ticket_banners: ticketBanners,
    price: price,
    location: locationResponse,
    token_metadata: {
      extra: JSON.stringify(extra),
    },
  };

  return (
    <div className="lg:flex lg:justify-center lg:items-center lg:align-middle lg:p-9 p-5 lg:min-h-screen">
      <div className="flex lg:justify-center lg:items-center lg:align-middle">
        <div className="mb-3 w-96">
          <div>
            <img src={urlArr} alt="" className="w-72 h-72 rounded-md" />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="formFile"
              className="inline-block mb-2 text-figma-400"
            >
              Event Banner *
            </label>
            <input
              required
              className="file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-white file:text-figma-500
              hover:file:bg-figma-500 hover:file:text-figma-400 text-figma-400"
              type="file"
              id="formFile"
              onChange={(e) => {
                retrieveFile(e);
              }}
            />
          </div>
          <h2
            className={`${uploaded ? 'inline-block text-figma-400' : 'hidden'}`}
          >
            File Uploaded Succesfully!
          </h2>
        </div>
      </div>
      <div className="lg:w-1/2 ">
        <Input
          required
          className="text-figma-400 mt-8 rounded-md"
          label="Event Title *"
          name="title"
          type="text"
          placeholder="Enter the Event Title"
          value={name}
          setValue={setName}
        />
        <Input
          required
          label="Description *"
          name="description"
          type="text"
          className="rounded-md mt-8"
          value={description}
          setValue={setDescription}
        />
        <div className="w-full">
          <h2 className="text-figma-400">Modality *</h2>
          <ModalityDropdown modality={modality} setModality={setModality} />
        </div>
        <div>
          {isLoaded ? (
            <div>
              {modality === 1 ? (
                <div>
                  <Autocomplete>
                    <Input
                      required
                      label="Location *"
                      name="location"
                      type="text"
                      className="rounded-md mt-8"
                      value={locationResponse}
                      setValue={setLocationResponse}
                    />
                  </Autocomplete>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex w-full space-x-3">
          <div>
            <h2 className="text-figma-400 mb-1">Capacity *</h2>
            <input
              aria-label="Capacity"
              className="text-md rounded-lg"
              type="text"
              name="capacity"
              placeholder="100,400,1000"
              id="capacity"
              onChange={(e) => {
                setCapacityInput(e.target.value);
              }}
            />
          </div>
          <Input
            required
            type="text"
            id="ticketType"
            name="ticketType"
            placeholder="VIP, GENERAL, X"
            className="text-md text-figma-400 mt-8 rounded-md"
            setValue={setTicketTypeInput}
            label="Ticket Types *"
          />
          <div>
            <h2 className="text-figma-400 mb-1">Prices in NEAR *</h2>
            <input
              aria-label="Price"
              className="text-md rounded-lg"
              type="text"
              name="price"
              placeholder="20,16,10"
              id="price"
              onChange={(e) => {
                setPriceInput(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="flex justify-between w-full space-x-4">
          <Input
            required
            type="date"
            id="date"
            name="date"
            placeholder={date}
            className="h-8 text-sm rounded-lg text-figma-400 mt-8"
            setValue={setDate}
            label="Event Date *"
          />
          <Input
            required
            type="time"
            id="time"
            name="time"
            placeholder={time}
            className="h-8 text-sm rounded-lg text-figma-400 mt-8"
            setValue={setTime}
            label="Hour *"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="formFile"
            className="inline-block mb-2 text-figma-400"
          >
            Ticket's Banner *
          </label>
          <input
            required
            className="file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-white file:text-figma-500
            hover:file:bg-figma-500 hover:file:text-figma-400 text-figma-400"
            type="file"
            id="formFile"
            multiple
            onChange={(e) => {
              retrieveTicketFiles(e);
            }}
          />
        </div>
        <button
          type="button"
          className="w-full lg:p-3  bg-figma-500 text-figma-300 font-semibold p-1 rounded-lg drop-shadow-lg mt-4"
          onClick={() => {
            handleSubmit();
          }}
        >
          Create Event
        </button>
      </div>
    </div>
  );
}
