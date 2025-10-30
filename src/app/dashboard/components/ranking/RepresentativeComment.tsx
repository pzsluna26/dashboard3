'use client';

interface RepresentativeCommentData {
  content: string;
  likes: number;
}

interface RepresentativeCommentProps {
  comment: RepresentativeCommentData;
}

export default function RepresentativeComment({ comment }: RepresentativeCommentProps) {
  if (!comment.content || comment.content === '대표 댓글이 없습니다.') {
    return (
      <div className="text-sm text-gray-500 text-center py-2">
        대표 댓글이 없습니다
      </div>
    );
  }

  // 댓글 내용이 너무 길면 자르기
  const truncatedContent = comment.content.length > 100 
    ? comment.content.substring(0, 100) + '...' 
    : comment.content;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          <svg 
            className="w-4 h-4 text-blue-500" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 leading-relaxed">
            "{truncatedContent}"
          </p>
          <div className="flex items-center gap-1 mt-2">
            <svg 
              className="w-3 h-3 text-red-500" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                clipRule="evenodd" 
              />
            </svg>
            <span className="text-xs text-gray-500 font-medium">
              {comment.likes.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}