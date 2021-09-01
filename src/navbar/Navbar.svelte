<svelte:options tag="mc-navbar" />

<script>
</script>

<link rel="stylesheet" href="app.css" />

<section class="bg-secondary text-white w-full">
		<div class="flex flex-row items-center mx-auto max-w-7xl">
           <mc-navdropdown class="md:hidden list-none" title="Menu">
                 <ul class="text-secondary text-xl w-full">
                    <mc-navlink>
                        <a href="#" >About</a>
                    </mc-navlink>
                    <mc-navlink>
                        <a href="#" >Academics</a>
                    </mc-navlink>
                    <mc-navlink>
                        <a href="#" >Admissions</a>
                    </mc-navlink>
                    <mc-navlink>
                        <a href="#" >Athletics</a>
                    </mc-navlink>
                    <mc-navlink>
                        <a href="#" >NEWS</a>
                    </mc-navlink>
                </ul>
            </mc-navdropdown>
        <ul class="hidden md:flex">
            <mc-navdropdown title="ABOUT">
                <div class="flex flex-col w-full">
                    <div class="text-2xl pb-3">About</div>
                    <div class="flex flex-row">
                        <div class="w-96">
                            <div class="text-md p-2">Internationally recognized in both Performing Arts, as well as it's top-ranked College of Computer Science & Engineering, GU offers students the opportunity to collaborate with the world's best and brightest faculty in multiple disciplines, all in an intimate, small-town campus setting.</div>
                        </div>
                        <div class="w-64 mx-2">
                            <div class="text-xl underline mb-1"></div>
                            <ul class="list-disc text-lg px-3">
                                <li><a href="#">History</a></li>
                                <li><a href="#">President's Page</a></li>
                                <li><a href="#">Mission</a></li>
                                <li><a href="#">Blog</a></li>
                                <li><a href="#">Campus Map</a></li>
                                <li><a href="#">Contact Us</a></li>
                                <li><a href="#">Events</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </mc-navdropdown>
            <mc-navdropdown title="ACADEMICS">
                <div class="flex flex-col w-full">
                    <div class="text-2xl pb-3">Academics</div>
                    <div class="flex flex-row">
                        <div class="w-96">
                            <div class="text-md p-2">Every class offered at GU averages a 20:1 student-to-faculty ratio, providing the
                            quality attention necessary for every student’s success. In addition, many faculty
                            members participate in our tutoring program “After Hours”, giving students the extra
                            help they need late into the night.</div>
                        </div>
                        <div class="w-64 mx-2">
                            <div class="text-xl underline mb-1">Current Students</div>
                            <ul class="list-disc text-lg px-5">
                                <li><a href="#">Course Catalog</a></li>
                                <li><a href="#">Library</a></li>
                                <li><a href="#">Study Abroad</a></li>
                                <li><a href="#">Final Exam Schedule</a></li>
                                <li><a href="#">Faculty Directory</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </mc-navdropdown>
            <mc-navdropdown title="ADMISSIONS">
                <div class="flex flex-col w-full">
                    <div class="text-2xl pb-3">Admissions</div>
                    <div class="flex flex-row">
                        <div class="w-64 mx-2">
                            <div class="text-xl underline mb-1">Future Students</div>
                            <ul class="list-disc text-lg px-5">
                                <li><a href="#">Undergraduate</a></li>
                                <li><a href="#">Graduate</a></li>
                                <li><a href="#">Transfer Students</a></li>
                            </ul>
                        </div>
                        <div class="w-64 mx-2">
                            <div class="text-xl underline mb-1">Apply Now!</div>
                            <ul class="list-disc text-lg px-5">
                                <li><a href="#">TrueCost Calculator</a></li>
                                <li><a href="#">Request information</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </mc-navdropdown>
            <mc-navdropdown title="ATHLETICS">
                <div class="flex flex-col w-full">
                    <div class="text-2xl pb-3">Athletics</div>
                    <div class="flex flex-row">
                        <div class="w-64 mx-2">
                            <div class="text-xl underline mb-1"></div>
                            <ul class="list-disc text-lg px-5">
                                <li><a href="#">Gallena Gophers</a></li>
                                <li><a href="#">University Recreation</a></li>
                                <li><a href="#">Prospective Athletes</a></li>
                                <li><a href="#">Tailgating Policy</a></li>
                                <li><a href="#">Ticketing</a></li>
                            </ul>
                        </div>
                </div>
            </mc-navdropdown>
            <mc-navdropdown title="CAMPUS LIFE">
                <div class="flex flex-col w-full">
                    <div class="text-2xl pb-3">Campus Life</div>
                    <div class="flex flex-row">
                        <div class="w-64 mx-2">
                            <div class="text-xl underline mb-1"></div>
                            <ul class="list-disc text-lg px-5">
                                <li><a href="#">Clubs & Organizations</a></li>
                                <li><a href="#">Housing & Dining</a></li>
                                <li><a href="#">Student Union</a></li>
                                <li><a href="#">Traditions</a></li>
                            </ul>
                        </div>
                </div>
            </mc-navdropdown>
            <mc-navlink>
                <a href="#" class="text-white">NEWS</a>
            </mc-navlink>
        </ul>
</div>
</section>


<style>
</style>


