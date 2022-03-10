import React, { useState, useEffect } from "react";
import { HiDownload } from "react-icons/hi";
import { Link, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { client, urlFor } from "../client";
import { MasonryLayout } from "./MasonryLayout";
import { pinDetailMorePinQuery, pinDetailQuery } from "../utils/data";
import Spinner from "./Spinner";

const PinDetail = ({ user }) => {
  const [pins, setPins] = useState(null);
  const [pinDetail, setPinDetail] = useState(null);
  const [comment, setComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  const { pinId } = useParams();

  const addComment = () => {
    if (comment) {
      setAddingComment(true);

      client
        .patch(pinId)
        .setIfMissing({ comments: [] })
        .insert("after", "comments[-1]", [{ comment, _key: uuidv4(), postedBy: { _type: "postedBy", _ref: user._id } }])
        .commit()
        .then(() => {
          fetchPinDetails();
          setComment("");
          setAddingComment(false);
        });
    }
  };

  const fetchPinDetails = () => {
    let query = pinDetailQuery(pinId);

    if (query) {
      client.fetch(query).then((data) => {
        setPinDetail(data[0]);

        if (data[0]) {
          query = pinDetailMorePinQuery(data[0]);

          client.fetch(query).then((res) => setPins(res));
        }
      });
    }
  };

  useEffect(() => {
    fetchPinDetails();
  }, [pinId]);

  if (!pinDetail) return <Spinner message="Sedang Dimuat" />;

  return (
    <>
      <div className="flex xl-flex-row flex-col m-auto bg-white" style={{ maxWidth: "1500px", borderRadius: "32px" }}>
        <div className="flex justify-center items-center md:items-start flex-initial">
          <img src={pinDetail?.image && urlFor(pinDetail.image).url()} alt="pin-image" className="rounded-t-3xl rounded-b-lg h-full" />
        </div>
        <div className="w-full p-5 flex-1 xl:min-w-620">
          <div className="flex items-center border-b-2 justify-between">
            <h1 className="text-4xl font-bold break-words">{pinDetail.title}</h1>
            <div className="flex gap-2 items-center bg-green-700 hover:bg-green-900 text-white p-2 rounded-lg mb-2">
              <a href={`${pinDetail.image.asset.url}?dl=`} download onClick={(e) => e.stopPropagation()} className="rounded-full flex flex-col items-center">
                <HiDownload fontSize={30} />
              </a>
              <a href={PinDetail.destination} target="_blank" rel="noreferrer" className="hidden md:contents">
                {pinDetail.destination.length > 15 ? `${pinDetail.destination.slice(0, 15)}...` : pinDetail.destination}
              </a>
            </div>
          </div>
          <Link to={`/user-profile/${pinDetail.postedBy?._id}`} className="flex gap-2 mt-5 items-center bg-white rounded-lg">
            <img src={pinDetail.postedBy?.image} alt="user-profile" className="w-8 h-8 rounded-full object-cover" />
            <p className="font-semibold capitalize">{pinDetail.postedBy?.userName}</p>
          </Link>
          <div className="border-b-2 pb-10">
            <p className="mt-3 ml-10">{pinDetail.about}</p>
          </div>
          <h2 className="mt-5 text-2xl">Komentar</h2>
          <div className="max-h-370 overflow-y-auto">
            {pinDetail?.comments?.map((item) => (
              <div className="flex gap-2 mt-5 items-center bg-white rounded-lg" key={item.comment}>
                <img src={item.postedBy?.image} className="w-10 h-10 rounded-full cursor-pointer" alt="user-profile" />
                <div className="flex flex-col">
                  <p className="font-bold">{item.postedBy?.userName}</p>
                  <p>{item.comment}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap mt-6 gap-3">
            <Link to={`user-profile/${PinDetail.postedBy?._id}`}>
              <img src={user.image} alt="user-profile" className="w-10 h-10 rounded-full cursor-pointer" />
            </Link>
            <input type="text" className="flex-1 border-gray-100 outline-none border-2 p-2 rounded-2xl focus:border-gray-300 w-24" placeholder="komentar" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button type="button" className="bg-red-500 text-white rounded-full px-6 py-2 font-semibold text-base outline-none hover:bg-red-900 " onClick={addComment}>
              {addingComment ? "Mengirim" : "Kirim"}
            </button>
          </div>
        </div>
      </div>

      {pins?.length > 0 ? (
        <>
          <h2 className="text-center font-bold text-2xl mt-8 mb-4">Gambar Serupa</h2>
          <MasonryLayout pins={pins} />
        </>
      ) : (
        <h2 className="text-center font-bold text-2xl mt-8 mb-4">Tidak ada Gambar Serupa</h2>
      )}
    </>
  );
};

export default PinDetail;
