// This is the Event we are listening to
import { Transfer as TransferEvent } from "../generated/BoredApesContract/BoredApesContract";

// These are the helpers
import { json, Bytes, dataSource, log } from "@graphprotocol/graph-ts";

// These are the ENTITY TYPES we defined in the schema
import { Token, TokenMetadata } from "../generated/schema";

// This is the template that is created every time a new token is discovered on chain
import { TokenMetadataTemplateInYaml as TokenMetadataTemplate } from "../generated/templates";

const ipfsHash = "QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq";

export function handleTransfer(event: TransferEvent): void {
  let token = Token.load(event.params.tokenId.toString());

  if (!token) {
    token = new Token(event.params.tokenId.toString());
    token.tokenID = event.params.tokenId;

    token.tokenURI = "/" + event.params.tokenId.toString();
    const tokenIpfsHash = ipfsHash + token.tokenURI;
    token.ipfsURI = tokenIpfsHash;

    TokenMetadataTemplate.create(tokenIpfsHash);
  }
  token.owner = event.params.to;
  token.updatedAtTimestamp = event.block.timestamp;
  token.save();
}

export function handleTokenMetadata(content: Bytes): void {
  if (content) {
    log.info("content: {}", [content.toString()]);
  } else {
    log.info("content: {}", ["null"]);
  }
  let tokenMetadata = new TokenMetadata(dataSource.stringParam());
  const value = json.fromBytes(content).toObject();

  if (value) {
    const image = value.get("image");
    const attributesValue = value.get("attributes");
    if (image) {
      log.info("image: {}", [image.toString()]);
    } else {
      log.info("image: {}", ["null"]);
    }
    // if (attributesValue) {
    //   log.info("attributes: {}", [attributesValue.toString()]);
    // } else {
    //   log.info("attributes: {}", ["null"]);
    // }

    if (image && attributesValue) {
      tokenMetadata.image = image.toString();
      log.info("image: {}", [tokenMetadata.image]);
      //   log.info("attributes: {}", [attributesValue.toString()]);

      //   const attributes = attributesValue.toArray();
      //   if (attributes.length > 0) {
      //     const attribute = attributes[0].toObject();

      //     // Access first attribute's properties using attribute.get('property_name')
      //     const trait_type0 = attribute.get("trait_type");
      //     const value0 = attribute.get("value");

      //     if (trait_type0) {
      //       log.info("trait_type0: {}", [trait_type0.toString()]);
      //     } else {
      //       log.info("trait_type0: {}", ["null"]);
      //     }
      //     if (value0) {
      //       log.info("value0: {}", [value0.toString()]);
      //     } else {
      //       log.info("value0: {}", ["null"]);
      //     }

      //     // Add null checks before assigning values
      //     if (trait_type0) {
      //       tokenMetadata.trait_type0 = trait_type0.toString();
      //     }
      //     if (value0) {
      //       tokenMetadata.value0 = value0.toString();
      //     }
      //   }
    }
    tokenMetadata.save();
  }
}
