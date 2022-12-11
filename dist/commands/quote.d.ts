export default function (msg: {
    channel: {
        send: (arg0: string) => void;
    };
}, tokens: string | any[]): Promise<void>;
