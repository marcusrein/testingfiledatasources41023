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

    if (image && attributesValue) {
      tokenMetadata.image = image.toString();
      log.info("image: {}", [tokenMetadata.image]);

      const traits = attributesValue.toArray();

      for (let i = 0; i < traits.length; i++) {
        const trait = traits[i].toObject();
        const trait_type = trait.get("trait_type");
        const value = trait.get("value");

        if (trait_type && value) {
          log.info("trait_type: {}", [trait_type.toString()]);
          log.info("value: {}", [value.toString()]);

          if (trait_type.toString() == "Hat") {
            tokenMetadata.trait_hat = value.toString();
          } else if (trait_type.toString() == "Fur") {
            tokenMetadata.trait_fur = value.toString();
          } else if (trait_type.toString() == "Background") {
            tokenMetadata.trait_background = value.toString();
          } else if (trait_type.toString() == "Eyes") {
            tokenMetadata.trait_eyes = value.toString();
          } else if (trait_type.toString() == "Clothes") {
            tokenMetadata.trait_clothes = value.toString();
          } else if (trait_type.toString() == "Mouth") {
            tokenMetadata.trait_mouth = value.toString();
          }
        }
      }
    }
    tokenMetadata.save();
  }
}
