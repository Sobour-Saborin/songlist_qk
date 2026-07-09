import { consumeRequestRateLimit } from '$lib/server/rate-limit';
import { supabaseAdmin } from '$lib/server/supabase';

export async function POST({ request }) {
  const body = await request.json();
  const { userId, songName, singer } = body;

  // 1分钟限流：单用户仅允许提交1次
  const canSubmit = await consumeRequestRateLimit({
    clientKey: userId,
    maxRequests: 1,
    windowMs: 1 * 60 * 1000
  });

  if (!canSubmit) {
    return new Response(JSON.stringify({
      code: 429,
      msg: "提交过于频繁，请等待1分钟后再试"
    }), { status: 429 });
  }

  // 下方原有愿望单入库逻辑保留，这里放你的supabase插入代码
  const { error } = await supabaseAdmin
    .from('wishlist')
    .insert({ user_id: userId, song_name: songName, singer: singer });

  if (error) {
    return new Response(JSON.stringify({ code: 500, msg: "提交失败，歌曲可能已存在" }), { status: 500 });
  }

  return new Response(JSON.stringify({ code: 200, msg: "愿望单提交成功" }), { status: 200 });
}
