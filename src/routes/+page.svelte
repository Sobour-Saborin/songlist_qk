<script lang="ts">
  import FilterPanel from '$lib/components/public/FilterPanel.svelte';
  import Hero from '$lib/components/public/Hero.svelte';
  import RequestForm from '$lib/components/public/RequestForm.svelte';
  import SongTable from '$lib/components/public/SongTable.svelte';
  import { matchesSongKeyword } from '$lib/songs';
  import { type SongLanguage, type SongStatus } from '$lib/types';

  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form?: ActionData } = $props();

  let query = $state('');
  let selectedLanguage = $state<'all' | SongLanguage>('all');
  let selectedTag = $state<string>('all');
  let selectedStatus = $state<'all' | SongStatus>('all');

  const filteredSongs = $derived(
    data.catalog.songs.filter((song) => {
      const matchesLanguage = selectedLanguage === 'all' || song.language === selectedLanguage;
      const matchesTag = selectedTag === 'all' || song.tags.includes(selectedTag);
      const matchesStatus = selectedStatus === 'all' || song.status === selectedStatus;

      return matchesSongKeyword(song, query) && matchesLanguage && matchesTag && matchesStatus;
    })
  );
</script>

<svelte:head>
  <title>江余Sobour_Saborin</title>
</svelte:head>

<div class="space-y-8 lg:space-y-10">
  <Hero catalog={data.catalog} />

  <section class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
    <FilterPanel
      tags={data.catalog.tags}
      total={data.catalog.songs.length}
      filtered={filteredSongs.length}
      bind:query
      bind:language={selectedLanguage}
      bind:tag={selectedTag}
      bind:status={selectedStatus}
    />

    <SongTable songs={filteredSongs} />
  </section>

  <RequestForm {form} />
</div>

import QRCode from 'qrcode';
import { onMount } from 'svelte';
let qrSrc = '';

async function refreshQr() {
  // 自动读取当前浏览器地址（实时临时链接）
  const currentUrl = window.location.href;
  qrSrc = await QRCode.toDataURL(currentUrl, { width: 240 });
}

onMount(refreshQr);

<div class="share-qr" style="text-align:center; padding:1rem;">
  <h3>扫码访问当前歌单页面</h3>
  <p style="font-size:12px; color:#666;">链接为临时地址，每次打开自动更新二维码</p>
  {#if qrSrc}
    <img src={qrSrc} alt="临时链接二维码" style="margin:10px 0; border-radius:10px;">
  {/if}
  <button on:click={refreshQr}>刷新二维码（链接更新后点这里）</button>
</div>
