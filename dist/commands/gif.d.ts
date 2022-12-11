export default function (msg: {
    channel: {
        send: (arg0: any) => void;
    };
}, tokens: any[]): Promise<void>;
