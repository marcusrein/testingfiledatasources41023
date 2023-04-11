import {
	Approval as ApprovalEvent,
	ApprovalForAll as ApprovalForAllEvent,
	OwnershipTransferred as OwnershipTransferredEvent,
	Transfer as TransferEvent,
} from "../generated/BoredApesContract/BoredApesContract";
import {
	Approval,
	ApprovalForAll,
	OwnershipTransferred,
	Transfer,
	Token,
	TokenMetadata,
	TokenMetadataAttributes,
	User,
} from "../generated/schema";

import { json, Bytes, dataSource } from "@graphprotocol/graph-ts";

import { TokenMetadata as TokenMetadataTemplate } from "../generated/templates";

const ipfsHash = "QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq";

export function handleApproval(event: ApprovalEvent): void {
	let entity = new Approval(
		event.transaction.hash.concatI32(event.logIndex.toI32())
	);
	entity.owner = event.params.owner;
	entity.approved = event.params.approved;
	entity.tokenId = event.params.tokenId;

	entity.blockNumber = event.block.number;
	entity.blockTimestamp = event.block.timestamp;
	entity.transactionHash = event.transaction.hash;

	entity.save();
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
	let entity = new ApprovalForAll(
		event.transaction.hash.concatI32(event.logIndex.toI32())
	);
	entity.owner = event.params.owner;
	entity.operator = event.params.operator;
	entity.approved = event.params.approved;

	entity.blockNumber = event.block.number;
	entity.blockTimestamp = event.block.timestamp;
	entity.transactionHash = event.transaction.hash;

	entity.save();
}

export function handleOwnershipTransferred(
	event: OwnershipTransferredEvent
): void {
	let entity = new OwnershipTransferred(
		event.transaction.hash.concatI32(event.logIndex.toI32())
	);
	entity.previousOwner = event.params.previousOwner;
	entity.newOwner = event.params.newOwner;

	entity.blockNumber = event.block.number;
	entity.blockTimestamp = event.block.timestamp;
	entity.transactionHash = event.transaction.hash;

	entity.save();
}

export function handleTransfer(event: TransferEvent): void {
	let token = Token.load(event.params.tokenId.toString());
	if (token == null) {
		token = new Token(event.params.tokenId.toString());
		token.tokenID = event.params.tokenId;

		const tokenIpfsHash =
			ipfsHash + "/" + event.params.tokenId.toString() + ".json";
		token.ipfsURI = tokenIpfsHash;

		TokenMetadataTemplate.create(tokenIpfsHash);

		token.save();
	}
	token.updatedAtTimestamp = event.block.timestamp;
	token.save();

	let user = User.load(event.params.to.toHex());
	if (user == null) {
		user = new User(event.params.to.toHex());
		user.address = event.params.to;
		user.save();
	}
	user.address = event.params.to;
	user.save();
}

export function handleTokenMetadata(content: Bytes): void {
	let tokenMetadata = new TokenMetadata(dataSource.stringParam());

	const value = json.fromBytes(content).toObject();

	if (value) {
		const image = value.get("image");
		const attributes = value.get("attributes");

		if (image && attributes) {
			tokenMetadata.image = image.toString();
		}
		const attribute0 = value.get("0");
		if (attribute0) {
			const attribute0Object = attribute0.toObject();
			const trait_type0 = attribute0Object.get("trait_type");
			const value0 = attribute0Object.get("value");

			if (attribute0Object && trait_type0 && value0) {
				const tokenMetadataAttributes = new TokenMetadataAttributes(
					dataSource.stringParam()
				);
				tokenMetadataAttributes.trait_type0 = trait_type0.toString();
				tokenMetadataAttributes.value0 = value0.toString();
			}
		}
	}
}
