import React, { useLayoutEffect } from "react";
import { fetcher } from "../../../../hooks/useFetch";
import MessageItem from "../MessageRenderer/MessageItem";
import DateItem from "../MessageRenderer/DateItem";
import useSWRSubscription from "swr/subscription";
/** Fetches messages from the backend and renders them */
const MessageStream = ({ channelID }) => {
  const containerRef = React.useRef(null);

  const scrollToBottom = () => {
    const scrollHeight = containerRef.current?.scrollHeight;
    const height = containerRef.current?.clientHeight;
    containerRef.current?.scrollTo({
      top: scrollHeight - height,
      left: 0,
    });
  };

  const { data } = useSWRSubscription(
    `axon.api.axon_message.get_messages_with_dates?channel_id=${channelID}`,
    (key, { next }) => {
      //Initial load
      fetcher(key).then((data) => next(null, data));

      if (channelID) {
        frappe.socketio.doc_subscribe("Axon Channel", channelID);
        frappe.socketio.doc_open("Axon Channel", channelID)
        frappe.realtime.on("message_updated", (event) => {
          if (event.channel_id !== channelID) return
          fetcher(key).then((data) => next(null, data));
        });
      }

      return () => {
        frappe.realtime.off("message_updated");
        frappe.socketio.doc_close("Axon Channel", channelID);
        try {
          frappe.socketio.doc_unsubscribe("Axon Channel", channelID);
        } catch (e) {
          // console.log(e)
        }
      }
    }, { keepPreviousData: true }
  );

  useLayoutEffect(() => {
    // Wait for the content to paint before scrolling
    setTimeout(() => {
      scrollToBottom();
    }, 200);
  }, [scrollToBottom, data]);

  return (
    <div>
      {/* TODO: Add Loading and Error states */}
      <div className="axon-message-stream-container" ref={containerRef}>
        {data?.message.map((message) => {
          if (message.block_type === "date") {
            return <DateItem date={message.data} key={message.data} />;
          } else {
            return (
              <MessageItem message={message.data} key={message.data.name} />
            );
          }
        })}
      </div>
    </div>
  );
};

export default MessageStream;
