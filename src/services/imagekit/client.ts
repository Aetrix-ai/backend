import ImageKit from "@imagekit/nodejs";
import { Config } from "../../config.js";
import { Media } from "@prisma/client";
import { MediaI } from "../../lib/schema.js";

interface CompareAndDeleteManyResult {
  media?: {
    deleteMany?: { id: number }[];
    create?: MediaI[];
  };
}

class ImageKitManager extends ImageKit {
  constructor() {
    super({
      privateKey: Config.IMAGEKIT_PRIVATE_KEY,
    });
  }
  /**
   *
   *  Compare abd Delete Many Media
   *  Given two arrays of media, this method identifies media present in the existingMedia array
   *  but absent in the updatedMedia array, and deletes them using the deleteMany method.
   *  return newly c
   *
   * @param existingMedia
   * @param updatedMedia
   * @returns
   */
  async CompareAndDeleteMany(
    existingMedia: Media[],
    updatedMedia: Media[] | MediaI[]
  ): Promise<CompareAndDeleteManyResult> {
    let result: CompareAndDeleteManyResult = {};
    try {
      const mediaToDelete = existingMedia.filter((media) => !updatedMedia.some((m) => m.fileId === media.fileId));

      if (mediaToDelete.length === 0) return result;

      await this.deleteMany(mediaToDelete);

      result.media = {
        deleteMany: mediaToDelete.map((m) => ({ id: m.id })),
      };

      const mediaToAdd = updatedMedia.filter(
        (media) => !existingMedia.some((m) => media.fileId === m.fileId)
      ) as MediaI[];
      if (mediaToAdd.length === 0) return result;

      result.media.create = mediaToAdd;
    } catch (error) {
      console.error("Error in CompareAndDeleteMany:", error);
    }
    return result;
  }

  /**
   * Delete Many Media Files from ImageKit
   * @param media
   * @returns
   */
  async deleteMany(media: Media[]) {
    if (media.length === 0) return;

    const fileIds = media.map((m) => m.fileId);

    return this.files.bulk.delete({ fileIds });
  }
}
export const ImageKitClient = new ImageKitManager();
