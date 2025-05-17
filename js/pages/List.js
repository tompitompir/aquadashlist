import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 100" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Difficulty</div>
                            <p>{{ level.difficulty || 'Demon' }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Skillset</div>
                            <p>{{ level.skillset || 'Unset' }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Additional Notes</div>
                            <p>{{ level.notes || '-' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 50"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else-if="selected +1 <= 150"><strong>100%</strong> or better to qualify</p>
                    <p v-else>This level does not accept new records.</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>Enjoyment:⠀{{ record.enjoyment }}/10</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a></p><br>
                        <p class="type-label-md">Records originally imported from <a href="https://docs.google.com/spreadsheets/d/1LYpU8Liha859vvNs9XUAZntQ59bz41UBbc0X0RSx8rs/edit?usp=drive_link" target="_blank">Aquadash Records Database by Axzyr</a></p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Demon List Rules</h3>
                    <p>
                        Those who have already beaten levels before december of 2024 can send a screenshot as proof to the #submit-records channel in the discord. A screenshot of the info tab is also required. This rule will be removed by 2025.
                    </p>
                    <p>
                        Every completion and progress (hard demon or harder) should have video proof.
                    </p>
                    <p>
                        Video verifications are only required for Hard, Insane and Extreme Demons.
                    </p>
                    <p>
                        The video should include audible clicks for insane demons and extreme demons.
                    </p>
                    <p>
                        Completions should include the whole level from start to finish.
                    </p>
                    <p>
                        The completion or progress has to be legitimate (same hacks are allowed/disallowed as on the Pointercrate Demonlist).
                    </p>
                    <p>
                        The video should be uploaded to Youtube or Google Drive. (If you dont have a youtube channel, send the video to us and we will upload it to the AquaDash channel as an unlisted video.)
                    </p>
                    <p>
                        Level skips can be used as long as it doesn't skip too much of the level.
                    </p>
                    <p>
                        The player can only submit their own completion or progress.
                    </p>
                    <p>
                        If the level doesn't have a built in LDM or it still lags with the LDM you can create your own as long as it doesn't make the level easier in any way (you should contact a list mod and send them a noclipped footage of the LDM to make sure it's allowed).
                    </p>
                    <p>
                        Click between frames is allowed.
                    </p>
                    <p>
                        We won't be accepting records for levels under top 50.
                    </p>

                    <p>
                        If you have any other questions just contact a list mod.
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
