type SponsorItem = {
	id: string;
	name: string;
	image: string;
	color: string;
	desc?: string;
	address?: string;
};

type SponsorGroup = {
	name: 'CNY' | 'Crypto';
	items: SponsorItem[];
};

export const SPONSOR_GROUPS: SponsorGroup[] = [
	{
		name: 'CNY',
		items: [
			{
				id: 'wechat',
				name: '微信',
				image: '/sponsor/wechat.jpg',
				color: '#09bb07',
			},
			{
				id: 'alipay',
				name: '支付宝',
				image: '/sponsor/alipay.jpg',
				color: '#00a0e9',
			},
		],
	},
	{
		name: 'Crypto',
		items: [
			{
				id: 'evm',
				name: 'ETH(EVM)',
				desc: 'ETH / BSC / Polygon / Arbitrum / Optimism',
				image: '/sponsor/evm.jpg',
				address: '0x345FD9765177535c356e789f283f75967BF08217',
				color: '#627eea',
			},
			{
				id: 'usdt_arb',
				name: 'USDT(Arb)',
				image: '/sponsor/usdt_arb.jpg',
				address: '0xBdf4910767422E3276Bf866b22c72737F2A53628',
				color: '#2d3748',
			},
			{
				id: 'usdt_bnb',
				name: 'USDT(BNB)',
				image: '/sponsor/usdt_bnb.jpg',
				address: '0xBdf4910767422E3276Bf866b22c72737F2A53628',
				color: '#f3ba2f',
			},
		],
	},
];
