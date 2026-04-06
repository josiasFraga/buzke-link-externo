interface ServiceRatingSource {
  media_avaliacoes?: number | null;
  _media_avaliacoes?: number | null;
  total_avaliacoes?: string | number | null;
  _total_avaliacoes?: string | number | null;
}

export function getServiceRatingValue(service: ServiceRatingSource) {
  const ratingCandidates = [service.media_avaliacoes, service._media_avaliacoes];

  for (const candidate of ratingCandidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate) && candidate > 0) {
      return candidate;
    }
  }

  return undefined;
}

export function getServiceReviewCount(service: ServiceRatingSource) {
  const reviewCount = Number(service.total_avaliacoes ?? service._total_avaliacoes ?? 0);

  if (!Number.isFinite(reviewCount) || reviewCount <= 0) {
    return 0;
  }

  return reviewCount;
}