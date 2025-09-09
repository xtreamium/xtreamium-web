import * as React from "react";


import { Helmet } from "react-helmet";
import castContext from "./cast-context";
import CastReceiver from "./cast-receiver";

const { useState, useEffect } = React;
const wait = (time: number) =>
  new Promise((res) => {
    setTimeout(res, time);
  });

function CastProvider({ children }: { children: React.ReactNode }) {
  const [cast, setCast] = useState<{
    castReceiver?: CastReceiver;
    castSender?: any;
  }>({});
  const [session, setSession] = useState<any>({});
  useEffect(() => {
    (async () => {
      let toBreak = false;
      let tries = 15;
      let castReceiver: CastReceiver;
      let castSender: any;
      while (true) {
        try {
          // @ts-ignore
          castReceiver = window.chrome.cast as CastReceiver;
          // @ts-ignore
          castSender = window.cast.framework as any;
          toBreak = true;
        } catch (err) {
          tries--;
          if (!tries) {
            toBreak = true;
          }
        } finally {
          if (toBreak) break;
        }
        await wait(95);
      }
      // @ts-ignore
      if (tries !== 0 && !!castReceiver) {
        setCast({
          castReceiver,
          castSender,
        });
      } else {
        throw new Error("Can't Load castReceiver and\\or castSender");
      }
    })();
  }, []);
  return (
    <>
      <Helmet>
        <script src="//www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1" />
        <script src="//www.gstatic.com/cast/sdk/libs/receiver/2.0.0/cast_receiver.js" />
      </Helmet>
      <castContext.Provider
        value={{
          ...cast,
          session,
          setSession,
        }}
      >
        {children}
      </castContext.Provider>
    </>
  );
}

export default CastProvider;
