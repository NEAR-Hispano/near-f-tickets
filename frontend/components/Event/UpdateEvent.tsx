import { useRouter } from 'next/router';
import React from 'react';
import { useNear } from '../../hooks/useNear';
import useUser from '../../hooks/useUser';
import Event from '../../models/Event';
import StatusDropdown from '../common/StatusDropdown';
import { Input } from '../inputs';
import { create } from 'ipfs-http-client';

export default function UpdateEvent() {
  const router = useRouter();
  const { index } = router.query;
  const [event, setEvent] = React.useState<Event>(null);
  const [date, setDate] = React.useState(event?.date);
  const [description, setDescription] = React.useState(event?.description);
  const [eventStatus, setEventStatus] = React.useState<number>(event?.status);
  const [file, setFile] = React.useState([]);
  const [urlArr, setUrlArr] = React.useState<string>(event?.banner);
  const [nearContext] = useNear();
  const [user] = useUser();
  const [uploaded, setUploaded] = React.useState(false);

  // @ts-ignore: Unreachable code error
  const client = create('https://ipfs.infura.io:5001/api/v0');

  const getEvent = async () => {
    setEvent(
      // @ts-ignore: Unreachable code error
      await nearContext.contracts.nftContract.get_event({
        index: parseInt(index[0]),
      })
    );
  };

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
      console.log('File uploaded ', url);
      console.log(file);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSubmit = async () => {
    // @ts-ignore: Unreachable code error
    await nearContext.contracts.nftContract.update_event(
      {
        index: parseInt(index[0]),
        description: description,
        date: date || '28-09-2022',
        status: eventStatus,
        banner: urlArr,
      },
      '300000000000000',
      '465000000000000000000000'
    );
    router.push('/app');
  };

  React.useEffect(() => {
    getEvent();
  }, [event]);

  return (
    <div className="lg:flex lg:justify-center lg:items-center lg:align-middle lg:p-9 p-5">
      <div className="flex lg:justify-center lg:items-center lg:align-middle">
        <div className="mb-3 w-96">
          <div className={`${uploaded ? 'flex' : 'hidden'}`}>
            <img src={urlArr} alt="" className="w-72 h-72" />
          </div>
          <label
            htmlFor="formFile"
            className="inline-block mb-2 text-figma-400"
          >
            Event Banner
          </label>
          <input
            required
            className="block w-full px-3 py-1.5 text-base font-normal text-figma-400 bg-white bg-clip-padding border border-solid border-gray-300 rounded-lg transition ease-in-out m-0 focus:text-figma-400 focus:bg-white focus:border-blue-600 focus:outline-none lg:border-0 lg:bg-figma-200"
            type="file"
            id="formFile"
            onChange={(e) => {
              retrieveFile(e);
            }}
          />
          <h2 className={`${uploaded ? 'inline-block' : 'hidden'}`}>
            File Uploaded Succesfully!
          </h2>
        </div>
      </div>
      <div className="lg:w-1/2 ">
        <Input
          required
          label="Description"
          name="description"
          type="text"
          className="rounded-md mt-8"
          placeholder={event?.description}
          value={description}
          setValue={setDescription}
        />
        <Input
          required
          type="datetime-local"
          id="date"
          name="date"
          placeholder={event?.date}
          className="h-8 text-sm rounded-lg text-figma-400 mt-8"
          setValue={setDate}
          label="Event Date"
        />
        <div>
          <StatusDropdown
            setEventStatus={setEventStatus}
            status={eventStatus}
          />
        </div>
        <button
          type="button"
          className="w-full lg:p-3  bg-figma-500 text-figma-300 font-semibold p-1 rounded-lg drop-shadow-lg mt-4"
          onClick={() => {
            handleSubmit();
          }}
        >
          Update Event
        </button>
      </div>
    </div>
  );
}
